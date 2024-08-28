import Counter from "./components/ComponentStateUpdateBatch.jsx";

export default function App() {
    return (
        <Counter />
    );
}


// Old working code from TODO list app

// export const BASE_URL = import.meta.env.MODE === "development" ? "http://127.0.0.1:4040/api" : "/api";
//
// function App() {
//     return (
//         <Stack h="100vh">
//             <Navbar />
//             <Container>
//                 <TodoForm />
//                 <TodoList />
//             </Container>
//         </Stack>
//     );
// }
//
// export default App