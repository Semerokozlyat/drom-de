import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "../App.tsx";

const TodoForm = () => {
	const [newTodo, setNewTodo] = useState("");

	const queryClient = useQueryClient();

	const {mutate: createTodo, isPending: isCreating } = useMutation({
		mutationKey: ["createTodo"],
		mutationFn: async(e: React.FormEvent) => {
			e.preventDefault();
			try {
				const response = await fetch(BASE_URL + `/todos`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({body: newTodo}),
				})

				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || "Unexpected response from POST /todos");
				}
				setNewTodo("");  // set the input field to empty
				return data;
			} catch (error) {
				console.log(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["todos"]});
		},
		onError: (error: any) => {
			alert(error.message);
		},
	})

	return (
		<form onSubmit={createTodo}>
			<Flex gap={2}>
				<Input
					type='text'
					value={newTodo}
					onChange={(e) => setNewTodo(e.target.value)}
					ref={(input) => input && input.focus()}
				/>
				<Button
					mx={2}
					type='submit'
					_active={{
						transform: "scale(.97)",
					}}
				>
					{isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
				</Button>
			</Flex>
		</form>
	);
};
export default TodoForm;

// STARTER CODE:

// import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
// import { useState } from "react";
// import { IoMdAdd } from "react-icons/io";

// const TodoForm = () => {
// 	const [newTodo, setNewTodo] = useState("");
// 	const [isPending, setIsPending] = useState(false);

// 	const createTodo = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		alert("Todo added!");
// 	};
// 	return (
// 		<form onSubmit={createTodo}>
// 			<Flex gap={2}>
// 				<Input
// 					type='text'
// 					value={newTodo}
// 					onChange={(e) => setNewTodo(e.target.value)}
// 					ref={(input) => input && input.focus()}
// 				/>
// 				<Button
// 					mx={2}
// 					type='submit'
// 					_active={{
// 						transform: "scale(.97)",
// 					}}
// 				>
// 					{isPending ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
// 				</Button>
// 			</Flex>
// 		</form>
// 	);
// };
// export default TodoForm;