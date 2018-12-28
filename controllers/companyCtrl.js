const User = require('../models/user');
const Company = require('../models/company');

exports.createCompany = async (req, res) => {

    if(req.body.name === undefined || req.body.address === undefined || req.body.city === undefined ||
        req.body.country === undefined  || req.body.sector === undefined || req.body.website === undefined
    ){
        return res.status(200).json({error: 'Tous les champs doivent être complétés'});   
    } 

    if(req.body.name === "" || req.body.address === "" || req.body.city === "" ||
        req.body.country === ""  || req.body.sector === "" || req.body.website === ""
    ){
        return res.status(200).json({error: 'Tous les champs doivent être complétés'});   
    } 

    const newCompany = new Company();
    newCompany.companyname = req.body.name;
    newCompany.address = req.body.address;
    newCompany.city = req.body.city;
    newCompany.country = req.body.country;   
    newCompany.sector = req.body.sector;
    newCompany.website = req.body.website;
    newCompany.admin = req.body.userId;   

    const companyData = await newCompany.save();

    await User.update({
        '_id': req.body.userId,
    },{
        $push: {companies: {
            company: companyData._id
        }}
    }); 

    return res.status(200).json({message: 'L\'entreprise a été créé'});
}


exports.getAllCompanies = async (req, res) => {
    const results = await Company.find({})
                            .populate("rating.user");

    return res.status(200).json({result: results});
}


exports.addReview = async (req, res) => {
    if(req.body.culture === "" || req.body.benefits === "" || req.body.balance === "" ||
        req.body.speed === ""  || req.body.review === "" || req.body.overall === ""
    ){
        return res.status(200).json({error: 'Tous les champs doivent être complétés'});   
    }     
    
    if(req.body.culture === undefined || req.body.benefits === undefined || req.body.balance === undefined ||
        req.body.speed === undefined  || req.body.review === undefined || req.body.overall === undefined
    ){
        return res.status(200).json({error: 'Tous les champs doivent être complétés'});   
    } 

    const company = await Company.update({
        "_id": req.body.companyId
    }, {
        $push: {rating: {
            user: req.body.userId,
            culture: req.body.culture,
            benefits: req.body.benefits,
            balance: req.body.balance,            
            speed: req.body.speed,
            review: req.body.review,
            userOverall: req.body.overall
        },
            ratingOverall: req.body.overall,
            cultureTotal: req.body.culture,                     
            benefitsTotal: req.body.benefits,     
            balanceTotal: req.body.balance,                     
            speedTotal: req.body.speed   
        },
        $inc: {totalStars: req.body.overall}
    });
    return res.status(200).json({message: 'L\'évaluation a été enregistré avec succès !'});
}

exports.addEmployee = async (req,res) => {
    const company = await Company.update({
        '_id': req.body.company._id,
        'employees.employee': {$ne: req.body.user._id} // Vérifier si l'emplyé n'éxiste pas dans la bdd
    },{
        $push: {employees: {
            employee: req.body.user._id
        }}
    });

    const user = await User.update({
        '_id': req.body.user._id,
    },{
        role: req.body.role,
    }); 

    return res.status(200).json({message: 'Le rôle a été ajouté avec succès !'});
}


exports.search = async (req,res) => {
    const searchName = req.body.company;
    const regex = new RegExp(searchName,'gi');
    const company = await Company.find({"companyname":regex});

    if(company.length > 0){
        return res.status(200).json({message: "Résultats de la recherche", results: company})
    }else{
        return res.status(200).json({message: "Résultats de la recherche", results: []})       
    }
}

exports.leaderBoard = async (req,res) => {
    const results = await Company.find({})
                        .sort({"totalStars": -1});

    return res.status(200).json({result: results});
}