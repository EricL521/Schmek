// screen displayed while connecting and loading from server
'use client';

import { useState } from 'react';

import style from './loading-screen.module.css';
import LoadingText from './loading-text';

export default function LoadingScreen({ status }) {
	return (
		<div id={style['loading-screen']}>
			<LoadingText text={status}/>
		</div>
	);
}