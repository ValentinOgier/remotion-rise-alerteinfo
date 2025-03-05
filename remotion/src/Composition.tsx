import {AbsoluteFill} from 'remotion';
import React from 'react';
import {NewsBackground} from './components/NewsBackground';
import {NewsContent} from './components/NewsContent';
import {Logo} from './components/Logo';
import {Gradient} from './components/Gradient';

export const MyComposition = () => {
	return (
		<AbsoluteFill style={{
			backgroundColor: 'white',
			width: 1080,
			height: 1920,
			position: 'relative',
		}}>
			<NewsBackground />
			<Gradient />
			<NewsContent />
			<Logo />
		</AbsoluteFill>
	);
};
