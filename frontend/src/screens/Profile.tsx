import UserAccountInfo from "../components/UserAccountInfo"

const Profile = () => {

    return <div className="h-screen bg-stone-700">
        <UserAccountInfo name={"Arslan"} username={"arsu@gmail.com"} totalGames={10} wins={6} draws={2} losses={2} />
    </div>
}

export default Profile