import {AbsoluteFill, staticFile} from 'remotion';
import React from 'react';

interface BackgroundProps {
	backgroundImage: string;
	isBackgroundImageUrl: boolean;
}

export const Background: React.FC<BackgroundProps> = ({
	backgroundImage,
	isBackgroundImageUrl,
}) => {
	const imageSource = isBackgroundImageUrl ? backgroundImage : staticFile(backgroundImage);

	return (
		<AbsoluteFill style={{
			position: 'absolute',
			width: '100%',
			height: '100%',
			zIndex: 0,
		}}>
			<img
				src={imageSource}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
				}}
				alt="Background"
			/>
		</AbsoluteFill>
	);
}; 