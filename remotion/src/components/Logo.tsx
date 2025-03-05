import {AbsoluteFill, useCurrentFrame, interpolate, Easing} from 'remotion';
import React from 'react';
import './fonts.css';
import type {NewsProps} from '../schema';

export const Logo: React.FC<NewsProps> = ({
	subtitle,
	showSubtitle,
	contentDescription,
	showContentDescription
}) => {
	const frame = useCurrentFrame();
	const LOGO_START = 2;
	const LETTER_DURATION = 15;
	const LETTER_DELAY = 3;
	const SLIDE_DISTANCE = 180;
	
	// Calcul des timings
	const LOGO_END = LOGO_START + (LETTER_DURATION + (3 * LETTER_DELAY)); // Fin de l'animation du logo
	const SUBTITLE_START = LOGO_END; // Commence dès que le logo finit
	const BOX_END = 60; // Fin de l'animation de la box (2 secondes)
	const DESCRIPTION_START = BOX_END + 30; // 1 seconde après la fin de la box

	const slideUp = (letterIndex: number) => {
		const startFrame = LOGO_START + letterIndex * LETTER_DELAY;
		const progress = interpolate(
			frame - startFrame,
			[0, LETTER_DURATION],
			[1, 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic)
			}
		);
		
		return {
			transform: `translateY(${progress * SLIDE_DISTANCE}px)`,
			opacity: interpolate(
				frame - startFrame,
				[0, LETTER_DURATION * 0.5],
				[0, 1],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.inOut(Easing.ease)
				}
			),
		};
	};

	const fadeIn = (startFrame: number) => {
		return {
			opacity: interpolate(
				frame - startFrame,
				[0, 30],
				[0, 1],
				{
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.inOut(Easing.ease)
				}
			),
		};
	};

	return (
		<AbsoluteFill style={{
			position: 'absolute',
			top: 300,
			left: 260,
			zIndex: 3,
		}}>
			<div style={{
				width: '720px',
				position: 'relative',
			}}>
				<h2 style={{
					fontFamily: 'Owners',
					fontSize: '180px',
					fontWeight: 700,
					lineHeight: '1em',
					letterSpacing: '-0.02em',
					margin: 0,
					color: 'white',
					display: 'flex',
				}}>
					<div style={{
						position: 'relative',
						height: '180px',
						overflow: 'hidden',
					}}>
						<span style={{
							display: 'inline-block',
							...slideUp(0),
						}}>
							R
						</span>
					</div>
					<div style={{
						position: 'relative',
						height: '180px',
						overflow: 'hidden',
					}}>
						<span style={{
							display: 'inline-block',
							...slideUp(1),
						}}>
							i
						</span>
					</div>
					<div style={{
						position: 'relative',
						height: '180px',
						overflow: 'hidden',
					}}>
						<span style={{
							display: 'inline-block',
							...slideUp(2),
						}}>
							s
						</span>
					</div>
					<div style={{
						position: 'relative',
						height: '180px',
						overflow: 'hidden',
					}}>
						<span style={{
							display: 'inline-block',
							...slideUp(3),
						}}>
							e
						</span>
					</div>
				</h2>
				{showSubtitle && (
					<p style={{
						fontFamily: 'Inter',
						fontWeight: 500,
						fontSize: '30px',
						lineHeight: '24.2px',
						letterSpacing: '-0.02em',
						textAlign: 'left',
						color: 'white',
						margin: '-10px 0 0 0',
						paddingLeft: '3px',
						...fadeIn(SUBTITLE_START),
					}}>
						{subtitle}
					</p>
				)}
				{showContentDescription && (
					<p style={{
						fontFamily: 'Inter',
						fontWeight: 500,
						fontSize: '30px',
						lineHeight: '24.2px',
						letterSpacing: '-0.02em',
						color: 'white',
						position: 'absolute',
						right: '-980px',
						top: '180px',
						transformOrigin: 'right top',
						transform: 'rotate(-90deg)',
						whiteSpace: 'nowrap',
						...fadeIn(DESCRIPTION_START),
					}}>
						{contentDescription}
					</p>
				)}
			</div>
		</AbsoluteFill>
	);
}; 