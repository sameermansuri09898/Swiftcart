
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";


/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});


/*
|--------------------------------------------------------------------------
| JWT Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("access_token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


/*
|--------------------------------------------------------------------------
| Get Categories
|--------------------------------------------------------------------------
*/

export const getCategories = async () => {

    try {

        const response = await api.get(
            "/Products/categories/"
        );

        return response.data;

    } catch (error) {

        console.error(
            "Category fetch error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Bulk CSV Upload
|--------------------------------------------------------------------------
*/

export const uploadBulkCSV = async (
    file,
    categoryId,
    onUploadProgress
) => {

    try {

        const formData = new FormData();


        /*
        |------------------------------------------------------------------
        | Backend:
        | request.FILES.get("file")
        |------------------------------------------------------------------
        */

        formData.append(
            "file",
            file
        );


        /*
        |------------------------------------------------------------------
        | Backend:
        | request.data.get("category_id")
        |------------------------------------------------------------------
        */

        formData.append(
            "category_id",
            categoryId
        );


        console.log(
            "Uploading CSV:",
            file.name
        );

        console.log(
            "Category ID:",
            categoryId
        );


        const response = await api.post(
            "/Products/products/bulk-upload/",
            formData,
            {
                onUploadProgress,
            }
        );


        return response.data;

    } catch (error) {

        console.error(
            "Bulk upload error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


export default api;
