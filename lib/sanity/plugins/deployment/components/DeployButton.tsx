import { Button, Flex, Inline, Text, useToast } from "@sanity/ui";
import { useState, useCallback } from "react";
import { useClient } from "sanity";
import { RocketIcon } from "@sanity/icons";

export default function DeployButton() {
	const client = useClient({ apiVersion: "2021-06-07" });
	const [isDeploying, setIsDeploying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const toast = useToast();

	const triggerDeploy = useCallback(async () => {
		setIsDeploying(true);
		setError(null);

		const stateMessages = {
			error: "Failed to trigger deployment",
			success: "Succeeded at triggering a deployment",
		};

		try {
			const newDoc = await client.createOrReplace({
				_type: "deployment",
				_id: "deployment",
			});

			toast.push({ status: "success", title: stateMessages.success });
		} catch (err) {
			toast.push({
				status: "error",
				title: stateMessages.error,
			});

			setError(stateMessages.error);

			console.error(error);
		} finally {
			setIsDeploying(false);
		}
	}, []);

	return (
		<Button
			onClick={triggerDeploy}
			padding={[4]}
			tone={isDeploying ? "caution" : "primary"}
			disabled={isDeploying}>
			<Inline space={2}>
				<Text
					style={{
						fontWeight: 500,
					}}
					size={4}>
					Deploy
				</Text>
				<RocketIcon fontSize={40} />
			</Inline>
		</Button>
	);
}
