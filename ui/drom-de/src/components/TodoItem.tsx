import {Badge, Box, Flex, Spinner, Text} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {Todo} from "./TodoList.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {BASE_URL} from "../App.tsx";

const TodoItem = ({ todo }: { todo: Todo }) => {
	const queryClient = useQueryClient();

	const {mutate: updateTodo, isPending: isUpdating} = useMutation({
		mutationKey: ["updateTodo"],
		mutationFn: async() => {
			if(todo.completed) return alert("Todo already completed.");
			try {
				const response = await fetch(BASE_URL + `/todos/${todo._id}`,
					{
						method: "PATCH",
						headers: {
							"Content-Type":"application/json",
						},
					})
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error || "Unexpected response from PATCH /api/todos/id");
				}
				return data;
			} catch(error) {
				console.log(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["todos"]});
		}
	});
	return (
		<Flex gap={2} alignItems={"center"}>
			<Flex
				flex={1}
				alignItems={"center"}
				border={"1px"}
				borderColor={"gray.600"}
				p={2}
				borderRadius={"lg"}
				justifyContent={"space-between"}
			>
				<Text
					color={todo.completed ? "green.200" : "yellow.100"}
					textDecoration={todo.completed ? "line-through" : "none"}
				>
					{todo.body}
				</Text>
				{todo.completed && (
					<Badge ml='1' colorScheme='green'>
						Done
					</Badge>
				)}
				{!todo.completed && (
					<Badge ml='1' colorScheme='yellow'>
						In Progress
					</Badge>
				)}
			</Flex>
			<Flex gap={2} alignItems={"center"}>
				<Box color={"green.500"} cursor={"pointer"} onClick={() => updateTodo()}>
					{!isUpdating && <FaCheckCircle size={20} />}
					{isUpdating && <Spinner size={"sm"} />}
				</Box>
				<Box color={"red.500"} cursor={"pointer"}>
					<MdDelete size={25} />
				</Box>
			</Flex>
		</Flex>
	);
};
export default TodoItem;

// STARTER CODE:

// import { Badge, Box, Flex, Text } from "@chakra-ui/react";
// import { FaCheckCircle } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";

// const TodoItem = ({ todo }: { todo: any }) => {
// 	return (
// 		<Flex gap={2} alignItems={"center"}>
// 			<Flex
// 				flex={1}
// 				alignItems={"center"}
// 				border={"1px"}
// 				borderColor={"gray.600"}
// 				p={2}
// 				borderRadius={"lg"}
// 				justifyContent={"space-between"}
// 			>
// 				<Text
// 					color={todo.completed ? "green.200" : "yellow.100"}
// 					textDecoration={todo.completed ? "line-through" : "none"}
// 				>
// 					{todo.body}
// 				</Text>
// 				{todo.completed && (
// 					<Badge ml='1' colorScheme='green'>
// 						Done
// 					</Badge>
// 				)}
// 				{!todo.completed && (
// 					<Badge ml='1' colorScheme='yellow'>
// 						In Progress
// 					</Badge>
// 				)}
// 			</Flex>
// 			<Flex gap={2} alignItems={"center"}>
// 				<Box color={"green.500"} cursor={"pointer"}>
// 					<FaCheckCircle size={20} />
// 				</Box>
// 				<Box color={"red.500"} cursor={"pointer"}>
// 					<MdDelete size={25} />
// 				</Box>
// 			</Flex>
// 		</Flex>
// 	);
// };
// export default TodoItem;