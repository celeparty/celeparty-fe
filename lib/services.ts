import axios from "axios"

export const axiosInstance = axios.create({
    baseURL: process.env.URL_API,
});

export const config = {
    headers: {
        'Authorization': 'Bearer ' + process.env.KEY_API
    }
}

export const getData = (url: string) => axios.get(`${process.env.URL_API + url}`, config)
    .then((res) => {
        return res
    }).catch((error) => {
        console.log(error)
    })




export const getDataOpen = (url: string) => axios.get(`${process.env.URL_API + url}`)
    .then((res) => {
        return res
    }).catch((error) => {
        console.log(error)
    })    
