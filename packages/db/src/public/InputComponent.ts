// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { z } from "zod";

/** Represents the enum public.InputComponent */
export enum InputComponent {
	textArea = "textArea",
	textInput = "textInput",
	datePicker = "datePicker",
	checkbox = "checkbox",
	fileUpload = "fileUpload",
	memberSelect = "memberSelect",
	confidenceInterval = "confidenceInterval",
	connectionSelect = "connectionSelect",
}

/** Zod schema for InputComponent */
export const inputComponentSchema = z.nativeEnum(InputComponent);
