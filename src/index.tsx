import { createApp, defineComponent } from "vue";
import { useShowDialog, useTheDialog } from "./use-dialog-service";

const DemoDialogBody = defineComponent({
	props: {
		name: String,
	},
	setup(props) {
		const theDialog = useTheDialog();

		return () => {
			return (
				<div>
					<h1>hello, {props.name}</h1>
					<div>
						<button
							type="button"
							onClick={() => {
								theDialog.emitOk("Ok");
								theDialog.emitClose();
							}}
						>
							Close
						</button>
					</div>
				</div>
			);
		};
	},
});

const app = createApp(
	defineComponent({
		setup() {
			const openDialog = useShowDialog();

			function onClick() {
				openDialog({
					component: DemoDialogBody,
					propsData: {
						name: "Tom",
					},
					width: "500px",
					height: "300px",
					onOK: (type: string) => {
						console.log("clicked", type);
					},
				});
			}

			return () => {
				return (
					<button type="button" onClick={onClick}>
						show
					</button>
				);
			};
		},
	}),
);
app.mount("#app");
