import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

export default async function main(prisma: PrismaClient, communityUUID: string) {
	await prisma.community.create({
		data: {
			id: communityUUID,
			name: "Unjournal",
			slug: "unjournal",
			avatar: "/demo/unjournal.png",
		},
	});

	const confidenceRatingSchema = await prisma.pubFieldSchema.create({
		data: {
			name: "confidencerating",
			namespace: "unjournal",
			schema: {
				$id: "unjournal:confidencerating",
				description: "The confidence rating assigned to a work.",
				type: "object",
				properties: {
					rating: {
						description:
							"A rating of quality from 0 to 100, with 0 being the worst and 100 being the best.",
						type: "integer",
						minimunm: 0,
						maximum: 100,
						required: true,
					},
					confidence: {
						description: "The degree of confidence the rater has in the rating given.",
						type: "integer",
						minimum: 1,
						maximum: 5,
						required: true,
					},
				},
			},
		},
	});

	const fieldIds = [...Array(10)].map(() => uuidv4());

	await prisma.pubField.createMany({
		data: [
			{ id: fieldIds[0], name: "Title" },
			{ id: fieldIds[1], name: "Description" },
			{ id: fieldIds[2], name: "Manager's Notes" },
			{ id: fieldIds[3], name: "Parent" },
			{ id: fieldIds[4], name: "Children" },
			{ id: fieldIds[5], name: "Content" },
			{ id: fieldIds[6], name: "Evaluated Paper" },
			{ id: fieldIds[7], name: "Tags" },
			{ id: fieldIds[8], name: "DOI" },
			{
				id: fieldIds[9],
				name: "Confidence Rating",
				pubFieldSchemaId: confidenceRatingSchema.id,
			},
		],
	});

	const submissionTypeId = "e09e894f-b3cf-4e9b-aeaa-48f7cb8c6225";
	await prisma.pubType.create({
		data: {
			id: submissionTypeId,
			name: "Submission",
			communityId: communityUUID,
			fields: {
				connect: [{ id: fieldIds[0] }, { id: fieldIds[1] }, { id: fieldIds[8] }],
			},
		},
	});
	const evaluationSummaryTypeId = "2981e8ca-dabe-416f-bce0-fcc418036529";
	await prisma.pubType.create({
		data: {
			id: evaluationSummaryTypeId,
			name: "Evaluation Summary",
			communityId: communityUUID,
			fields: {
				connect: [
					{ id: fieldIds[0] },
					{ id: fieldIds[1] },
					{ id: fieldIds[2] },
					{ id: fieldIds[3] },
				],
			},
		},
	});

	const authorResponseTypeId = "d2ad1f23-f310-4974-8d45-3c55a3dc0638";
	await prisma.pubType.create({
		data: {
			id: authorResponseTypeId,
			name: "Author Response",
			communityId: communityUUID,
			fields: {
				connect: [{ id: fieldIds[0] }, { id: fieldIds[1] }, { id: fieldIds[3] }],
			},
		},
	});

	const evaluationTypeId = "81d18691-3ac4-42c1-b55b-d3b2c065b9ad";
	await prisma.pubType.create({
		data: {
			id: evaluationTypeId,
			name: "Evaluation",
			communityId: communityUUID,
			fields: {
				connect: [
					{ id: fieldIds[0] },
					{ id: fieldIds[1] },
					{ id: fieldIds[3] },
					{ id: fieldIds[9] },
				],
			},
		},
	});

	const user1 = await prisma.user.create({
		data: {
			slug: faker.lorem.slug(),
			email: faker.internet.email(),
			name: faker.person.fullName(),
			avatar: faker.image.avatar(),
		},
	});

	const user2 = await prisma.user.create({
		data: {
			slug: faker.lorem.slug(),
			email: faker.internet.email(),
			name: faker.person.fullName(),
			avatar: faker.image.avatar(),
		},
	});

	const member = await prisma.member.create({
		data: {
			userId: user1.id,
			communityId: communityUUID,
			canAdmin: true,
		},
	});

	const memberGroup = await prisma.memberGroup.create({
		data: {
			canAdmin: false,
			communityId: communityUUID,
			users: {
				connect: [{ id: user2.id }],
			},
		},
	});

	// const submission1 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "Advance Market Commitments: Insights from Theory and Experience",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Ten years ago, donors committed $1.5 billion to a pilot Advance Market Commitment (AMC) to help purchase pneumococcal vaccine for low-income countries. The AMC aimed to encourage the development of such vaccines, ensure distribution to children in low-income countries, and pilot the AMC mechanism for possible future use. Three vaccines have been developed and more than 150 million children immunized, saving an estimated 700,000 lives. This paper reviews the economic logic behind AMCs, the experience with the pilot, and key issues for future AMCs.`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const toAskForConsent = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "The Governance of Non-Profits and their Social Impact: Evidence from a Randomized Program in Healthcare in the Democratic Republic of Congo",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: "Substantial funding is provided to the healthcare systems of low-income countries. However, an important challenge is to ensure that this funding be used efficiently. This challenge is complicated by the fact that a large share of healthcare services in low-income countries is provided by non-profit health centers that often lack i) effective governance structures and ii) organizational know-how and adequate training. In this paper, we argue that the bundling of performance-based incentives with auditing and feedback (A&F) is a potential way to overcome these obstacles. First, the combination of feedback and performance-based incentives—that is, feedback joint with incentives to act on this feedback and achieve specific health outcomes—helps address the knowledge gap that may otherwise undermine performance-based incentives. Second, coupling feedback with auditing helps ensure that the information underlying the feedback is reliable—a prerequisite for effective feedback. To examine the effectiveness of this bundle, we use data from a randomized governance program conducted in the Democratic Republic of Congo. Within the program, a set of health centers were randomly assigned to a “governance treatment” that consisted of performance-based incentives combined with A&F, while others were not. Consistent with our prediction, we find that the governance treatment led to i) higher operating efficiency and ii) improvements in health outcomes. Furthermore, we find that funding is not a substitute for the governance treatment—health centers that only receive funding increase their scale, but do not show improvements in operating efficiency nor health outcomes.",
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const toEvaluate = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "ADVANCE MARKET COMMITMENTS: INSIGHTS FROM THEORY AND EXPERIENCE",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Ten years ago, donors committed $1.5 billion to a pilot Advance Market Commitment (AMC) to help purchase pneumococcal vaccine for low-income countries. The AMC aimed to encourage the development of such vaccines, ensure distribution to children in low-income countries, and pilot the AMC mechanism for possible future use. Three vaccines have been developed and more than 150 million children immunized, saving an estimated 700,000 lives. This paper reviews the economic logic behind AMCs, the experience with the pilot, and key issues for future AMCs.`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluating1 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: 'Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China" (Buntaine et al)',
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: 'This will be evaluation 1 of "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China" - Revised 11 August because of a small oversight',
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluating2 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "Artificial Intelligence and Economic Growth”: Philip Trammell",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `An evaluation of “Artificial Intelligence and Economic Growth” for Unjournal`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const authorRejection = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: submissionTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "Do Celebrity Endorsements Matter? A Twitter Experiment Promoting Vaccination In Indonesia",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `You haver to reject me. Pleseeee. Reject meeeeeeee`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluationSummary1 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: evaluationSummaryTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "Evaluation summary and metrics: “Artificial Intelligence and Economic Growth”",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Summary, metrics and ratings, and Manager's comments on Evaluation of “Artificial Intelligence and Economic Growth” by Aghion et al.`,
	// 					},
	// 					{
	// 						fieldId: fieldIds[2],
	// 						value: "Ive never seen a squeaky wheel effect climate change",
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluationSummary2 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: evaluationSummaryTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: `Evaluation Summary and Metrics: "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China"`,
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Evaluation Summary and Metrics: "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China"`,
	// 					},
	// 					{
	// 						fieldId: fieldIds[2],
	// 						value: "Ive never seen an 'AI'. Prove it.",
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const authorsResponse = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: authorResponseTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: `Authors response to the Evaluation of "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China"`,
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Wealth. Fame. Power. The man who had acquired everything in this world, the Pirate King, Gol D. Roger. The final words that were said at his execution, sent people to the seas. "My wealth and treasures? If you want it, I'll let you have it. Look for it, I left it all at that place." Ever since, pirates from all over the world set sail for the Grand Line, searching for One Piece, the treasure that would make their dreams come true.`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const authorsResponse2 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: authorResponseTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: `Authors response to Evaluation 2 of “Artificial Intelligence and Economic Growth”: Philip Trammell`,
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `You can beleive it or not, but i am telling you right now, that, that AI back there is is not real!`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluation1 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: evaluationTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: 'Evaluation 1 of "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China" (Buntaine et al)',
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: 'Evaluation 1 of "Does the Squeaky Wheel Get More Grease? The Direct and Indirect Effects of Citizen Participation on Environmental Governance in China" - Revised 11 August because of a small oversight',
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	// const evaluation2 = await prisma.pub.create({
	// 	data: {
	// 		pubTypeId: evaluationTypeId,
	// 		communityId: communityUUID,
	// 		values: {
	// 			createMany: {
	// 				data: [
	// 					{
	// 						fieldId: fieldIds[0],
	// 						value: "Evaluation 2 of “Artificial Intelligence and Economic Growth”: Philip Trammell",
	// 					},
	// 					{
	// 						fieldId: fieldIds[1],
	// 						value: `Philip Trammell's Evaluation 2 of “Artificial Intelligence and Economic Growth” for Unjournal`,
	// 					},
	// 				],
	// 			},
	// 		},
	// 	},
	// });

	const stageIds = [...Array(7)].map((x) => uuidv4());
	await prisma.stage.createMany({
		data: [
			{
				id: stageIds[0],
				communityId: communityUUID,
				name: "Submitted",
				order: "aa",
			},
			{
				id: stageIds[1],
				communityId: communityUUID,
				name: "Ask Author for Consent",
				order: "bb",
			},
			{
				id: stageIds[2],
				communityId: communityUUID,
				name: "To Evaluate",
				order: "cc",
			},
			{
				id: stageIds[3],
				communityId: communityUUID,
				name: "Under Evaluation",
				order: "dd",
			},
			{
				id: stageIds[4],
				communityId: communityUUID,
				name: "In Production",
				order: "ff",
			},
			{
				id: stageIds[5],
				communityId: communityUUID,
				name: "Published",
				order: "gg",
			},
			{
				id: stageIds[6],
				communityId: communityUUID,
				name: "Shelved",
				order: "hh",
			},
		],
	});

	await prisma.permission.create({
		data: {
			member: {
				connect: { id: member.id },
			},
			stages: {
				connect: [{ id: stageIds[0] }],
			},
		},
	});

	await prisma.permission.create({
		data: {
			memberGroup: {
				connect: { id: memberGroup.id },
			},
			stages: {
				connect: [{ id: stageIds[0] }],
			},
		},
	});

	await prisma.permission.create({
		data: {
			memberGroup: {
				connect: { id: memberGroup.id },
			},
			stages: {
				connect: [{ id: stageIds[1] }],
			},
		},
	});

	await prisma.permission.create({
		data: {
			memberGroup: {
				connect: { id: memberGroup.id },
			},
			stages: {
				connect: [{ id: stageIds[2] }],
			},
		},
	});

	await prisma.permission.create({
		data: {
			member: {
				connect: { id: member.id },
			},
			stages: {
				connect: [{ id: stageIds[3] }],
			},
		},
	});

	// Submitted --> Consent, To Evaluate, Under Evaluation, Shelved
	await prisma.stage.update({
		where: { id: stageIds[0] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[0] },
						{ destinationId: stageIds[1] },
						{ destinationId: stageIds[2] },
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// Consent --> To Evaluate, Under Evaluation, Shelved
	await prisma.stage.update({
		where: { id: stageIds[1] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[1] },
						{ destinationId: stageIds[2] },
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// To Evaluate --> Under Evaluation, Shelved
	await prisma.stage.update({
		where: { id: stageIds[2] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[2] },
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// Under Evaluation --> In Production, Shelved
	await prisma.stage.update({
		where: { id: stageIds[3] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[4] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// Production --> Evaluation, Published, Shelved
	await prisma.stage.update({
		where: { id: stageIds[4] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[4] },
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[5] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// Published --> Evaluation, Production, Shelved
	await prisma.stage.update({
		where: { id: stageIds[5] },
		data: {
			moveConstraints: {
				createMany: {
					data: [
						{ destinationId: stageIds[5] },
						{ destinationId: stageIds[3] },
						{ destinationId: stageIds[4] },
						{ destinationId: stageIds[6] },
					],
				},
			},
		},
	});

	// Shelved --> No Constraints?
	/* await prisma.stage.update({
		where: { id: stageIds[6] },
		data: {
			moveConstraints: {
				createMany: {
					data: [],
				},
			},
		},
	});*/

	// await prisma.pub.update({
	// 	where: { id: submission1.id },
	// 	data: {
	// 		stages: { connect: { id: stageIds[0] } },
	// 	},
	// });
	// await prisma.pub.update({
	// 	where: { id: toAskForConsent.id },
	// 	data: {
	// 		stages: { connect: { id: stageIds[1] } },
	// 		permissions: { create: { memberGroupId: memberGroup.id } },
	// 	},
	// });
	// await prisma.pub.update({
	// 	where: { id: toEvaluate.id },
	// 	data: { stages: { connect: { id: stageIds[2] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluating1.id },
	// 	data: { stages: { connect: { id: stageIds[3] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluating2.id },
	// 	data: { stages: { connect: { id: stageIds[3] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluationSummary1.id },
	// 	data: { stages: { connect: { id: stageIds[4] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluationSummary2.id },
	// 	data: { stages: { connect: { id: stageIds[4] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: authorsResponse.id },
	// 	data: { stages: { connect: { id: stageIds[4] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: authorsResponse2.id },
	// 	data: { stages: { connect: { id: stageIds[4] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluation1.id },
	// 	data: { stages: { connect: { id: stageIds[5] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: evaluation2.id },
	// 	data: { stages: { connect: { id: stageIds[5] } } },
	// });
	// await prisma.pub.update({
	// 	where: { id: authorRejection.id },
	// 	data: { stages: { connect: { id: stageIds[6] } } },
	// });

	const submissionsIntegrationUrl =
		process.env.NODE_ENV === "production"
			? "https://integration-submissions.onrender.com"
			: "http://localhost:3002";
	const submissionsIntegration = await prisma.integration.create({
		data: {
			name: "Submission Manager",
			actions: [
				{
					name: "submit",
					text: "Submit Pub",
					href: `${submissionsIntegrationUrl}/actions/submit`,
					kind: "stage",
				},
			],
			settingsUrl: `${submissionsIntegrationUrl}/configure`,
		},
	});

	const evaluationsIntegrationUrl =
		process.env.NODE_ENV === "production"
			? "https://integration-evaluations.onrender.com"
			: "http://localhost:3001";
	const evaluationsIntegration = await prisma.integration.create({
		data: {
			name: "Evaluation Manager",
			actions: [
				{
					name: "manage",
					text: "Manage Evaluation",
					href: `${evaluationsIntegrationUrl}/actions/manage`,
				},
				// This needs to be registered for the emails to work, but we don't want it to show on each pub...hrm...
				{
					name: "evaluate",
					text: "Evaluate Pub",
					href: `${evaluationsIntegrationUrl}/actions/evaluate`,
				},
			],
			settingsUrl: `${evaluationsIntegrationUrl}/configure`,
		},
	});

	const integrationInstances = [
		{
			id: "af837db6-9a1f-4b38-878f-f84fde8a0b50",
			name: "Unjournal Submissions Manager",
			integrationId: submissionsIntegration.id,
			stageId: stageIds[0],
		},
		{
			id: "d6177ad1-ae7d-43b7-9c12-dcd31a38f255",
			name: "Unjournal Evaluation Manager",
			integrationId: evaluationsIntegration.id,
			stageId: stageIds[3],
		},
	];

	Promise.all(
		integrationInstances.map((instance) => {
			return prisma.integrationInstance.create({
				data: {
					communityId: communityUUID,
					...instance,
				},
			});
		})
	);
}
