let getUserProfilePage = (req, res) => {
    return res.render("userProfile.ejs");
};

let getUserProfileEditPage = (req, res) => {
    return res.render("userProfileEdit.ejs");
};

let getAdminProfilePage = (req, res) => {
    return res.render("adminProfile.ejs");
};

module.exports = {
    getAdminProfilePage,
    getUserProfileEditPage,
    getUserProfilePage,
};
