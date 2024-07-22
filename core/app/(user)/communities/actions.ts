"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import type { CommunitiesId, PubTypesId, UsersId } from "db/public";
import { MemberRole } from "db/public";
import { expect } from "utils";

import type { TableCommunity } from "./getCommunityTableColumns";
import type { UserAndMemberships } from "~/lib/types";
import { corePubFields } from "~/actions/corePubFields";
import { db } from "~/kysely/database";
import { defineServerAction } from "~/lib/server/defineServerAction";
import { slugifyString } from "~/lib/string";
import { crocCrocId } from "~/prisma/exampleCommunitySeeds/croccroc";
import { unJournalId } from "~/prisma/exampleCommunitySeeds/unjournal";

export const createCommunity = defineServerAction(async function createCommunity({
	user,
	name,
	slug,
	avatar,
}: {
	name: string;
	slug: string;
	avatar?: string;
	user: UserAndMemberships;
}) {
	if (!user.isSuperAdmin) {
		return {
			title: "Failed to create community",
			error: "User is not a super admin",
		};
	}
	if (slug === "unjournal" || slug === "croccroc") {
		return {
			title: "Failed to remove community",
			error: "Cannot update example community",
		};
	}
	try {
		const communityExists = await db
			.selectFrom("communities")
			.selectAll()
			.where("slug", "=", `${slug}`)
			.executeTakeFirst();

		if (communityExists) {
			return {
				title: "Failed to create community",
				error: "Community with that slug already exists",
			};
		} else {
			const c = expect(
				await db
					.insertInto("communities")
					.values({
						name,
						slug: slugifyString(slug),
						avatar,
					})
					.returning(["id", "name", "slug", "avatar", "createdAt"])
					.executeTakeFirst()
			);
			const communityUUID = c.id as CommunitiesId;

			const pubTypeId: string = uuidv4();

			const corePubSlugs = corePubFields.map((field) => field.slug);

			const memberPromise = db
				.insertInto("members")
				.values({
					userId: user.id as UsersId,
					communityId: c.id as CommunitiesId,
					role: MemberRole.admin,
				})
				.returning("id")
				.executeTakeFirst();

			const pubFieldsPromise = db
				.selectFrom("pub_fields")
				.selectAll()
				.where("pub_fields.slug", "in", corePubSlugs)
				.execute();

			const [fields, member] = await Promise.all([pubFieldsPromise, memberPromise]);
			const pubTypesPromise = db
				.with("core_pub_type", (db) =>
					db
						.insertInto("pub_types")
						.values({
							id: pubTypeId as PubTypesId,
							name: "Submission ",
							communityId: c.id as CommunitiesId,
						})
						.returning("id")
				)
				.insertInto("_PubFieldToPubType")
				.values((eb) =>
					fields.map((field) => ({
						A: field.id,
						B: eb.selectFrom("core_pub_type").select("id"),
					}))
				)
				.execute();

			const stagesPromise = db
				.insertInto("stages")
				.values([
					{
						communityId: communityUUID,
						name: "Submitted",
						order: "aa",
					},
					{
						communityId: communityUUID,
						name: "Ask Author for Consent",
						order: "bb",
					},
					{
						communityId: communityUUID,
						name: "To Evaluate",
						order: "cc",
					},
					{
						communityId: communityUUID,
						name: "Under Evaluation",
						order: "dd",
					},
					{
						communityId: communityUUID,
						name: "In Production",
						order: "ff",
					},
					{
						communityId: communityUUID,
						name: "Published",
						order: "gg",
					},
					{
						communityId: communityUUID,
						name: "Shelved",
						order: "hh",
					},
				])
				.returning("id")
				.execute();

			const [_, stagesReturn] = await Promise.all([pubTypesPromise, stagesPromise]);
			const stages = stagesReturn.map((stage) => stage.id);

			const permissionPromise = db
				.with("new_permission", (db) =>
					db
						.insertInto("permissions")
						.values({
							memberId: member?.id,
						})
						.returning("id")
				)
				.insertInto("_PermissionToStage")
				.values((eb) => [
					{
						A: eb.selectFrom("new_permission").select("id"),
						B: stages[0],
					},
					{
						A: eb.selectFrom("new_permission").select("id"),
						B: stages[1],
					},
					{
						A: eb.selectFrom("new_permission").select("id"),
						B: stages[2],
					},
					{
						A: eb.selectFrom("new_permission").select("id"),
						B: stages[3],
					},
				])
				.execute();

			const moveConstraintPromise = db
				.insertInto("move_constraint")
				.values([
					{
						//  Submitted can be moved to: Consent, To Evaluate, Under Evaluation, Shelved
						stageId: stages[0],
						destinationId: stages[1],
					},
					{
						stageId: stages[1],
						destinationId: stages[2],
					},
					{
						stageId: stages[2],
						destinationId: stages[3],
					},
					{
						stageId: stages[3],
						destinationId: stages[4],
					},
					{
						stageId: stages[4],
						destinationId: stages[5],
					},
				])
				.execute();

			const createPubPromise = db
				.with("new_pubs", (db) =>
					db
						.insertInto("pubs")
						.values({
							communityId: communityUUID,
							pubTypeId: pubTypeId as PubTypesId,
						})
						.returning("id")
				)
				.with("pubs_in_stages", (db) =>
					db.insertInto("PubsInStages").values((eb) => [
						{
							pubId: eb.selectFrom("new_pubs").select("id"),
							stageId: stages[0],
						},
					])
				)
				.insertInto("pub_values")
				.values((eb) => [
					{
						pubId: eb.selectFrom("new_pubs").select("new_pubs.id"),
						fieldId: fields.find((field) => field.slug === "pubpub:title")!.id,
						value: '"The Activity of Slugs I. The Induction of Activity by Changing Temperatures"',
					},
					{
						pubId: eb.selectFrom("new_pubs").select("new_pubs.id"),
						fieldId: fields.find((field) => field.slug === "pubpub:content")!.id,
						value: '"LONG LIVE THE SLUGS"',
					},
				])
				.execute();
			await Promise.all([permissionPromise, moveConstraintPromise, createPubPromise]);
		}
		revalidatePath("/");
	} catch (error) {
		return {
			title: "Failed to create community",
			error: "An unexpected error occurred",
			cause: error,
		};
	}
});

export const removeCommunity = defineServerAction(async function removeCommunity({
	user,
	community,
}: {
	user: UserAndMemberships;
	community: TableCommunity;
}) {
	if (!user.isSuperAdmin) {
		return {
			title: "Failed to remove community",
			error: "User is not a super admin",
		};
	}
	if (community.id === unJournalId || community.id === crocCrocId) {
		return {
			title: "Failed to remove community",
			error: "Cannot remove example community",
		};
	}
	try {
		await db
			.deleteFrom("communities")
			.where("id", "=", community.id as CommunitiesId)
			.executeTakeFirst();

		revalidatePath("/");
		return;
	} catch (error) {
		return {
			title: "Failed to remove community",
			error: "An unexpected error occurred",
			cause: error,
		};
	}
});
