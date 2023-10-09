'use client';

import dynamic from "next/dynamic";

// DO NOT render clientpage on server
const ClientPage = dynamic(() => import("./client-page"), {ssr: false});

export default function Page() {
	return (
		<ClientPage />
	);
};
