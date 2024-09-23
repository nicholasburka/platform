import React from "react";

import { PubsId, StagesId } from "db/public";
import { DialogContent, DialogTitle } from "ui/dialog";
import { Skeleton } from "ui/skeleton";

import type { PubCRUDMethod } from "./types";
import { SearchParamModal } from "~/lib/client/SearchParamModal";
import { getModalSearchParam } from "~/lib/server/modal";
import { CRUDMap } from "./CRUDMap";
import { PubCreate } from "./PubCreate";
import { parsePubCRUDSearchParam } from "./pubCRUDSearchParam";
import { PubRemove } from "./PubRemove";
import { PubUpdate } from "./PubUpdate";

const PubCRUD = ({
	method,
	identifyingString,
	parentId,
}: {
	method: PubCRUDMethod;
	identifyingString: string;
	parentId?: PubsId;
}) => {
	if (method === "create") {
		return <PubCreate stageId={identifyingString as StagesId} parentId={parentId} />;
	}

	if (method === "update") {
		return <PubUpdate pubId={(identifyingString || parentId) as PubsId} />;
	}

	if (method === "remove") {
		return <PubRemove pubId={(identifyingString || parentId) as PubsId} />;
	}

	return null;
};

export const PubCRUDDialogue = ({
	// children,
	parentId,
}: {
	//children: React.ReactNode;
	parentId?: PubsId;
}) => {
	const pubCRUDSearchParam = getModalSearchParam() || "";

	const params = parsePubCRUDSearchParam();

	return (
		<SearchParamModal identifyingString={pubCRUDSearchParam}>
			<DialogContent className="max-h-full min-w-[32rem] max-w-fit overflow-auto">
				{params?.method ? (
					<>
						<DialogTitle>{CRUDMap[params.method].title}</DialogTitle>
						<PubCRUD
							method={params.method}
							identifyingString={params.identifyingString}
							parentId={parentId}
						/>
					</>
				) : (
					<Skeleton className="h-4 w-52" />
				)}

				{/* {children} */}
			</DialogContent>
		</SearchParamModal>
	);
};
