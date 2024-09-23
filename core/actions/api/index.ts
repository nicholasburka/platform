// shared actions between server and client

import type * as z from "zod";

import { cache } from "react";

import type { Action, Event } from "db/public";

import { pubEnteredStage, pubInStageForDuration, pubLeftStage } from "../_lib/rules";
import * as email from "../email/action";
import * as http from "../http/action";
import * as log from "../log/action";
import * as move from "../move/action";
import * as pdf from "../pdf/action";
import * as pushToV6 from "../pushToV6/action";

export const actions = {
	[log.action.name]: log.action,
	[pdf.action.name]: pdf.action,
	[email.action.name]: email.action,
	[pushToV6.action.name]: pushToV6.action,
	[http.action.name]: http.action,
	[move.action.name]: move.action,
} as const;

export const getActionByName = cache(<N extends Action>(name: N) => {
	if (!(name in actions)) {
		throw new Error(`Action ${name} not found`);
	}

	return actions[name];
});

export const rules = {
	[pubInStageForDuration.event]: pubInStageForDuration,
	[pubEnteredStage.event]: pubEnteredStage,
	[pubLeftStage.event]: pubLeftStage,
} as const;

export const getRuleByName = <T extends Event>(name: T) => {
	return rules[name];
};

export const humanReadableEvent = <T extends Event>(
	event: T,
	config?: (typeof rules)[T]["additionalConfig"] extends undefined
		? never
		: z.infer<NonNullable<(typeof rules)[T]["additionalConfig"]>>
) => {
	const rule = getRuleByName(event);
	if (config && rule.additionalConfig) {
		return rule.display.withConfig(config);
	}

	return rule.display.base;
};

export const serializeRule = <T extends Event>(
	event: T,
	instanceName: string,
	config?: (typeof rules)[T]["additionalConfig"] extends undefined
		? never
		: z.infer<NonNullable<(typeof rules)[T]["additionalConfig"]>>
) => `${instanceName} will run when ${humanReadableEvent(event, config)}`;
