import Profile from './components/Profile.jsx';

export default function App() {
    return (
        <Profile />
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