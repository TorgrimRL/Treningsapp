import LandingPage from "../components/LandingPage";

// export const meta = () => {
//   return [
//     { title: "New Remix App" },
//     { name: "description", content: "Welcome to Remix!" },
//   ];
// };

export default function Index() {
  return (
    <div style={{ paddingTop: "30px" }}>
      <LandingPage />
    </div>
  );
}
