import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import TodoItem from "./TodoItem";
import {useQuery} from "@tanstack/react-query";

export type Todo = {
	_id: number;
	body: string;
	completed: boolean;
}

const TodoList = () => {
	const { data: todos, isLoading } = useQuery<Todo[]>({
		queryKey: ["todos"],
		queryFn: async () => {
			try {
				const response = await fetch("http://127.0.0.1:4040/api/todos");
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Unexpected response from /api/todos");
				}
				return data['items'] || [];
			} catch (error) {
				console.log(error);
			}
		},
	});
	return (
		<>
			<Text fontSize={"4xl"} textTransform={"uppercase"} fontWeight={"bold"} textAlign={"center"} my={2}
			  bgGradient={'linear(to-r, yellow, red)'} bgClip='text'
			>
				Today's Tasks
			</Text>
			{isLoading && (
				<Flex justifyContent={"center"} my={4}>
					<Spinner size={"xl"} />
				</Flex>
			)}
			{!isLoading && todos?.length === 0 && (
				<Stack alignItems={"center"} gap='3'>
					<Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
						All tasks completed! 🤞
					</Text>
					<img src='/golang_icon.png' alt='Go logo' width={70} height={70} />
				</Stack>
			)}
			<Stack gap={3}>
				{todos?.map((todo) => (
					<TodoItem key={todo._id} todo={todo} />
				))}
			</Stack>
		</>
	);
};
export default TodoList;

// STARTER CODE:

// import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
// import { useState } from "react";
// import TodoItem from "./TodoItem";

// const TodoList = () => {
// 	const [isLoading, setIsLoading] = useState(true);
// 	const todos = [
// 		{
// 			_id: 1,
// 			body: "Buy groceries",
// 			completed: true,
// 		},
// 		{
// 			_id: 2,
// 			body: "Walk the dog",
// 			completed: false,
// 		},
// 		{
// 			_id: 3,
// 			body: "Do laundry",
// 			completed: false,
// 		},
// 		{
// 			_id: 4,
// 			body: "Cook dinner",
// 			completed: true,
// 		},
// 	];
// 	return (
// 		<>
// 			<Text fontSize={"4xl"} textTransform={"uppercase"} fontWeight={"bold"} textAlign={"center"} my={2}>
// 				Today's Tasks
// 			</Text>
// 			{isLoading && (
// 				<Flex justifyContent={"center"} my={4}>
// 					<Spinner size={"xl"} />
// 				</Flex>
// 			)}
// 			{!isLoading && todos?.length === 0 && (
// 				<Stack alignItems={"center"} gap='3'>
// 					<Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
// 						All tasks completed! 🤞
// 					</Text>
// 					<img src='/go.png' alt='Go logo' width={70} height={70} />
// 				</Stack>
// 			)}
// 			<Stack gap={3}>
// 				{todos?.map((todo) => (
// 					<TodoItem key={todo._id} todo={todo} />
// 				))}
// 			</Stack>
// 		</>
// 	);
// };
// export default TodoList;