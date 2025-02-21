import React, { useState } from 'react'

function Profile() {
    const [userData, setUserData] = useState("")
    const getProfileData = () => {
        const token = JSON.parse(localStorage.getItem("Item"))

        const header = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        axios.get("https://api.escuelajs.co/api/v1/auth/profile", header)
            .then((res) => {
                setUserData(res.data)
                console.log("Profile Data", res)
            })
            .catch((err) => {
                console.log("Profile Data Failed", err)
            })
    }
    const handleLogOut = () => {
        setUserData("")
        localStorage.removeItem("Item")
        alert("Log Out Successs")
    }

    return (
        <div>
            <p>This is Profile Page</p>
            <button className='bg-blue-400 text-white px-3 py-1 mr-2' onClick={getProfileData}>Get Profile Data</button>
            <button className='bg-red-400 text-white px-3 py-1' onClick={handleLogOut}>Log Out</button>
            {userData &&
                <div>
                    <p>Name :{userData?.name || "N/A"} </p>
                    <p>Email : {userData?.email || "N/A"} </p>
                    <p>Role : {userData?.role || "N/A"}</p>
                    <img className='rounded-full h-20 w-20' src={userData?.avatar} alt="avatar" />
                </div>
            }
        </div>
    )
}

export default Profile