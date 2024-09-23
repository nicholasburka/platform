import "server-only";

import { Suspense } from "react";

import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "ui/dialog";

import type { PageContext } from "./PubsRunActionDropDownMenu";
import { SearchParamModal } from "~/lib/client/SearchParamModal";
import { getActionInstance } from "~/lib/server/actions";
import { findCommunityBySlug } from "~/lib/server/community";
import { getModalSearchParam } from "~/lib/server/modal";
import { SkeletonCard } from "../skeletons/SkeletonCard";
import { parseActionRunFormQueryParam } from "./actionRunFormQueryParam";
import { ActionRunFormWrapper } from "./ActionRunFormWrapper";

export const ActionRunModal = ({ pageContext }: { pageContext: PageContext }) => {
	const modalString = getModalSearchParam() || "";

	const isActionRunFormModalString = /action-run-form/.test(modalString);

	return (
		<SearchParamModal identifyingString={modalString}>
			<Suspense fallback={<SkeletonCard />}>
				{isActionRunFormModalString && (
					<ActionRunModalInner
						identifyingString={modalString}
						pageContext={pageContext}
					/>
				)}
			</Suspense>
		</SearchParamModal>
	);
};

const ActionRunModalInner = async ({
	identifyingString,
	pageContext,
}: {
	identifyingString: string;
	pageContext: PageContext;
}) => {
	const queryParam = parseActionRunFormQueryParam(identifyingString);

	if (!queryParam) {
		return null;
	}

	const { actionInstanceId, pubId } = queryParam;
	const [actionInstance, community] = await Promise.all([
		getActionInstance(actionInstanceId).executeTakeFirst(),
		findCommunityBySlug(),
	]);

	if (!actionInstance || !community) {
		// TODO: Show error state
		return null;
	}

	return (
		<DialogContent className="max-h-full overflow-y-auto">
			<DialogHeader>
				<DialogTitle>{actionInstance.name || actionInstance.action}</DialogTitle>
			</DialogHeader>

			<ActionRunFormWrapper
				actionInstance={actionInstance}
				pubId={pubId}
				communityId={community.id}
				pageContext={pageContext}
			/>
		</DialogContent>
	);
};
