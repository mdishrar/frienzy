
export const formatMessageTime = (date) =>{
    return new Date(date).toLocaleDateString("en-US",{
        hour : "2-digit",
        day : "2-digit",
        hour12 : false,
    })
} 