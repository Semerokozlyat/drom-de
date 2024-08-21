import {Container, Stack} from "@chakra-ui/react";
import Navbar from "./components/Navbar.tsx";
import TodoForm from "./components/TodoForm.tsx";
import TodoList from "./components/TodoList.tsx";

function App() {
  return (
    <Stack h="100vh">
        <Navbar />
        <Container>
            <TodoForm />
            <TodoList />
        </Container>
    </Stack>
  );
}

export default App
