"use client";
import { Card, CardContent } from "ui";
import PubRow from "../pubs/PubRow";
import { StagesData } from "./page";
import { Button } from "ui";
import Link from "next/link";

type Props = { stages: NonNullable<StagesData>, token: string };
type IntegrationAction = { text: string, href: string, kind?: "stage" };

const StageList: React.FC<Props> = function ({ stages, token }) {
	return (
		<div>
			{stages.map((stage) => {
				return (
					<div key={stage.id} className="mb-20">
						<h3 className="font-bold text-lg mb-2">{stage.name}</h3>
						{stage.integrationInstances.map((instance) => {
							if (!Array.isArray(instance.integration.actions)) {
								return null
							}
							return instance.integration.actions?.map((action: IntegrationAction) => {
								if (action.kind === "stage") {
									const href = new URL(action.href)
									href.searchParams.set('instanceId', instance.id)
									href.searchParams.set('token', token)
									return (
										<Button variant="outline" size="sm" asChild>
											<Link href={href.toString()}>{action.text}</Link>
										</Button>
									)
								}
							})
						})}
						<Card >
							<CardContent className="pt-4">
								{stage.pubs.map((pub, index, list) => {
									return <>
										<PubRow key={pub.id} pub={pub} token={token} />
										{index < list.length - 1 && <hr />}
									</>
								})}
							</CardContent>
						</Card>
					</div>
				);
			})}
		</div>
	);
};
export default StageList;
