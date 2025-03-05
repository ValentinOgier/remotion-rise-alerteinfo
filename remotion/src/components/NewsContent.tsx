import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import React from 'react';
import './fonts.css';
import type {NewsProps} from '../schema';

export const NewsContent: React.FC<NewsProps> = ({
	title,
	content,
	highlightedContent,
	source,
	showSource,
	accentColor,
	boxColor,
	textColor
}) => {
	const frame = useCurrentFrame();

	// Timing des animations
	const BOX_START = 0;
	const BOX_DURATION = 25;
	const TITLE_START = 10;
	const CONTENT_START = 15;
	const SOURCE_START = 20;
	const FADE_DURATION = 15;
	const SLIDE_DISTANCE = 50; // distance en pixels

	const fadeIn = (startFrame: number) => {
		return {
			opacity: interpolate(
				frame - startFrame,
				[0, FADE_DURATION],
				[0, 1],
				{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
			)
		};
	};

	const slideAndFade = (startFrame: number) => {
		const opacity = interpolate(
			frame - startFrame,
			[0, BOX_DURATION],
			[0, 1],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
		);
		
		const translateY = interpolate(
			frame - startFrame,
			[0, BOX_DURATION],
			[SLIDE_DISTANCE, 0],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
		);

		return {
			opacity,
			transform: `translateY(${translateY}px)`,
		};
	};

	const renderContent = () => {
		if (!highlightedContent || highlightedContent.length === 0) return content;

		let result = [content];
		highlightedContent.forEach((highlight) => {
			result = result.flatMap(text => {
				if (typeof text === 'string') {
					const parts = text.split(highlight);
					return parts.reduce((acc, part, i) => {
						if (i === 0) return [part];
						return [...acc, <span key={highlight + i} style={{color: accentColor}}>{highlight}</span>, part];
					}, [] as (string | JSX.Element)[]);
				}
				return [text];
			});
		});

		return result;
	};

	return (
		<AbsoluteFill style={{
			position: 'absolute',
			top: -460,
			left: 0,
			right: 0,
			zIndex: 2,
			display: 'flex',
			justifyContent: 'flex-end',
			flexDirection: 'column',
		}}>
			<div style={{
				backgroundColor: boxColor,
				borderRadius: '60px',
				padding: '80px',
				display: 'flex',
				flexDirection: 'column-reverse',
				width: '1800px',
				margin: '0 auto',
				...slideAndFade(BOX_START),
			}}>
				{showSource && (
					<div style={{
						textAlign: 'right',
						margin: 0,
						textRendering: 'geometricPrecision',
						...fadeIn(SOURCE_START),
					}}>
						<span style={{
							color: textColor,
							fontFamily: 'Inter',
							fontSize: '40px',
							fontStyle: 'normal',
							fontWeight: 500,
							lineHeight: 'normal',
							letterSpacing: '-0.8px',
						}}>
							{'Source : '}
						</span>
						<span style={{
							color: textColor,
							fontFamily: 'Inter',
							fontSize: '40px',
							fontStyle: 'normal',
							fontWeight: 400,
							lineHeight: 'normal',
							letterSpacing: '-0.8px',
						}}>
							{source}
						</span>
					</div>
				)}
				<p style={{
					fontFamily: 'Inter',
					fontSize: '80px',
					fontWeight: 700,
					lineHeight: '96.8px',
					letterSpacing: '-0.02em',
					margin: 0,
					color: textColor,
					textRendering: 'geometricPrecision',
					fontFeatureSettings: '"calt" 1, "kern" 1',
					...fadeIn(CONTENT_START),
				}}>
					{renderContent()}
				</p>
				<h1 style={{
					fontFamily: 'Mango Grotesque',
					fontSize: '200px',
					fontWeight: 900,
					lineHeight: '0.96em',
					margin: 0,
					color: accentColor,
					...fadeIn(TITLE_START),
				}}>
					{title}
				</h1>
			</div>
		</AbsoluteFill>
	);
}; 