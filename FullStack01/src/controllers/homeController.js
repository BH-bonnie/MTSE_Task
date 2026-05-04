import db from "../models/index";
import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        console.log('--------------------------------');
        console.log(data);
        console.log('--------------------------------');
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (error) {
        console.log(error);
    }
}
let getAboutPage = async (req, res) => {
    return res.send('test/about.ejs');
}

let getCRUD = async (req, res) => {
    return res.render('crud.ejs');
}
let getFindAllCRUD = async (req, res) => {
    let data = await CRUDService.getAllUsers();
    return res.render('users/findAllUser.ejs', {
        datalist: data
    });
}
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('Post CRUD from server');
}
let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        if (!userData) {
            return res.send('User not found');
        }
        return res.render('users/updateUser.ejs', {
            data: userData
        });
    } else {
        return res.send('User not found');
    }
}
let putCRUD = async (req, res) => {
    let data = req.body;
    await CRUDService.updateUserData(data);
    return res.redirect('/get-crud');
}
let deleteCRUD = async (req, res) => {
    let userId = req.query.id;
    if (userId) {
        await CRUDService.deleteUserById(userId);
        return res.redirect('/get-crud');
    } else {
        return res.send('User not found');
    }
}
module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    getFindAllCRUD: getFindAllCRUD,
    postCRUD: postCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}