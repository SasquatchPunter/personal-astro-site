import { Flex, ToastProvider } from "@sanity/ui";
import DeployButton from "./DeployButton";

export default function DeploymentToolComponent() {
	return (
		<ToastProvider>
			<Flex justify="center" align="center" height="fill">
				<DeployButton />
			</Flex>
		</ToastProvider>
	);
}
