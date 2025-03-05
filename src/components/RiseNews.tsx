import {AbsoluteFill} from 'remotion';
import {NewsContent} from './NewsContent';
import {Gradient} from './Gradient';
import {Background} from './Background';
import {Logo} from './Logo';
import React from 'react';
import type {NewsProps} from '../schema';

export const RiseNews: React.FC<NewsProps> = (props) => {
	return (
		<AbsoluteFill style={{
			backgroundColor: '#FFFFFF',
		}}>
			<Background
				backgroundImage={props.backgroundImage}
				isBackgroundImageUrl={props.isBackgroundImageUrl}
			/>
			<Gradient accentColor={props.accentColor} />
			<Logo {...props} />
			<NewsContent {...props} />
		</AbsoluteFill>
	);
}; 