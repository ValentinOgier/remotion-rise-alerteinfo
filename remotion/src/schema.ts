import {z} from 'zod';

export const NewsSchema = z.object({
	title: z.string().default('ALERTE INFO'),
	content: z.string(),
	highlightedContent: z.array(z.string()).optional(),
	source: z.string(),
	showSource: z.boolean().default(true),
	subtitle: z.string().default("Image d'illustration"),
	showSubtitle: z.boolean().default(true),
	contentDescription: z.string().default("Image d'illustration"),
	showContentDescription: z.boolean().default(true),
	backgroundImage: z.string(),
	isBackgroundImageUrl: z.boolean().default(false),
	accentColor: z.string().default('#0B4FF0'),
	boxColor: z.string().default('#F5F5F5'),
	textColor: z.string().default('#333333'),
});

export type NewsProps = z.infer<typeof NewsSchema>;

export const defaultProps: NewsProps = {
	title: "ALERTE INFO",
	content: "Le président ukrainien s'est dit prêt, mardi lors d'un entretien au « Guardian », à un échange de territoires avec le Kremlin, dans le cadre d'éventuelles négociations de paix sous l'égide des États-Unis.",
	highlightedContent: ["président ukrainien", "éventuelles négociations de paix", "États-Unis"],
	source: "AFP",
	showSource: true,
	subtitle: "Image d'illustration",
	showSubtitle: true,
	contentDescription: "Image d'illustration",
	showContentDescription: true,
	backgroundImage: "assets/images/placeholder.svg",
	isBackgroundImageUrl: false,
	accentColor: "#0B4FF0",
	boxColor: "#F5F5F5",
	textColor: "#333333",
}; 