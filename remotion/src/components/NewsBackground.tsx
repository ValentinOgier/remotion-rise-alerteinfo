import {AbsoluteFill} from 'remotion';
import React from 'react';
import backgroundImage from '../assets/images/zelensky.png';

export const NewsBackground: React.FC = () => {
	return (
		<AbsoluteFill style={{
			backgroundImage: `url(${backgroundImage})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			position: 'absolute',
			zIndex: 0,
		}} />
	);
}; 