import {AbsoluteFill} from 'remotion';
import React from 'react';
import type {NewsProps} from '../schema';

interface GradientProps {
	accentColor: string;
}

export const Gradient: React.FC<GradientProps> = ({accentColor}) => {
	// Convertir la couleur en RGB pour pouvoir utiliser rgba
	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	};

	const rgb = hexToRgb(accentColor);
	const transparentColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)` : `${accentColor}00`;

	return (
		<AbsoluteFill style={{
			position: 'absolute',
			width: 2160,
			height: 2154,
			top: -100,
			background: `linear-gradient(145deg, ${accentColor} -23.25%, ${transparentColor} 49.76%)`,
			zIndex: 1,
		}} />
	);
}; 