var request = require("request-promise").defaults({ jar: true });
const rp = require("request-promise-native");
const cheerio = require("cheerio");
const fs = require("fs");
const cookiejar = request.jar();
const readline = require('readline');
var colors = require('@colors/colors');
const Functions = require('./Functions');

class Core {
    constructor(username, password) {

        this.username = username;
        this.password = password;

        this.parsCodersUrl = 'https://parscoders.com';

        this.FunctionsClass = new Functions;
        this.FunctionsClass.starterMessage();
    }













    async auth() {

        this.FunctionsClass.sleep(500); // Pause process for handle errors

        var authOptions = {
            'method': 'POST',
            'url': `${this.parsCodersUrl}/login`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                'username': this.username,
                'password': this.password,
            },
            simple: false,
            followAllRedirects: true,
        }; // Set request authOptions

        await request.post(authOptions);


    }






    async scrapeData(url) {

        return request(url, function (error, response) {
            if (!error && response.statusCode === 200) {
                return response.body;
            } else {
                return false;
            }
        });
    }





    async send(options) {

        await this.auth()
            .then(result => {
            })
            .catch(error => {
                return error;
            });
        try {
            return await request(options);

        } catch (error) {
            return error;
        }


    }









    async getProjectsRow(filter = {}) {


        let projects = []; // Define projects array/object
        let collectOptions, collectData, collectBody;
        // Collect data from project-search

        collectOptions = {
            'method': 'POST',
            'url': `${this.parsCodersUrl}/project/ajax/project-search`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: JSON.stringify(filter),
            simple: false,
            followAllRedirects: true,
        };

        collectData = await request.post(collectOptions);
        try {
            if (collectData = JSON.parse(collectData)) {
                collectBody = collectData['project-row']; // Save data body here
            } else {
                return false;
            }

        } catch (error) {
            return false
        }


        if (
            typeof collectData !== 'object' &&
            collectBody != undefined
        ) { // Check data variable 
            return false;
        }

        const $ = cheerio.load(collectBody);
        const projectsDiv = $(".project-list-item");

        projectsDiv.map(projectKey => { // Loop all projects-elements

            const project = projectsDiv[projectKey];

            let project_id = $(project).attr("id").match(/\d/g).join(""); // find and filter project-id
            let project_url = $(project).find(".project--link").attr("href"); // find and filter project-url

            if (project_id && project_url) { // Validate collected data
                const projectData = {
                    id: project_id,
                    title: $(project).find(".project--link").text().replace(/\n/g, ' ').replace(/\s+/g, ' '),
                    price: ($(project).find(".ms-1").text()) ? $(project).find(".ms-1").text().match(/\d/g).join("").replace(/\s/g, ",") : '',
                    url: `${this.parsCodersUrl}${project_url}`,
                };

                projects.push(projectData); // Push in projects variable

            }


        });

        return this.FunctionsClass.shuffleArray(projects); // Shuffle projects and return

    }










    async getPage(page) {


        const projects = []; // Define projects array
        //filter = filter.join(','); // Define filter query

        await this.auth().then(authResult => {
        }).catch(error => {
            return error;
        }); // Login for access to scrap data

        let requestBody, url; // Define some variable

        url = `${this.parsCodersUrl}/project/only-available/${page}`; // Make URL
        console.log(url.green);
        await request(url, function (error, response, body) {
            requestBody = body;
        }); // Send request for collect data


        const $ = cheerio.load(requestBody);

        let id;

        $('.todo-tasklist-item').each((index, element) => {
            const project = {};

            id = ($(element).find('.todo-tasklist-item-title a').attr('href')) ? $(element).find('.todo-tasklist-item-title a').attr('href').replace(/\D/g, '') : false;

            if (id) {
                // Scrap title
                project.id = id;
                project.url = this.parsCodersUrl + $(element).find('.todo-tasklist-item-title a').attr('href');

            }

            projects.push(project);
        });

        return projects; // Return

    }






    async getNewProjects(filter = [], page = 1) {


        const projects = []; // Define projects array
        //filter = filter.join(','); // Define filter query

        await this.auth().then(authResult => {
        }).catch(error => {
            return error;
        }); // Login for access to scrap data

        let requestBody, url; // Define some variable

        url = `${this.parsCodersUrl}/project/only-available/${page}/skills/${filter}`; // Make URL
        console.log(url.green);
        await request(url, function (error, response, body) {
            requestBody = body;
        }); // Send request for collect data


        const $ = cheerio.load(requestBody);

        let id;

        $('.todo-tasklist-item').each((index, element) => {
            const project = {};

            id = ($(element).find('.todo-tasklist-item-title a').attr('href')) ? $(element).find('.todo-tasklist-item-title a').attr('href').replace(/\D/g, '') : false;

            if (id) {
                // Scrap title
                project.id = id;
                project.url = this.parsCodersUrl + $(element).find('.todo-tasklist-item-title a').attr('href');

            }

            projects.push(project);
        });

        return projects; // Return

    }













    async fetchBid(bid) {
        if (bid.id === undefined && bid === undefined) {
            return;
        }

        try {


            await this.auth().then(authResult => {
            }).catch(error => {
                return error;
            }); // Login for access to scrap data


            var bid_page = await this.scrapeData(bid.url);
            const $ = cheerio.load(bid_page);

            if ($('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(4) > span').text() === '') {
                console.log('Can Not Fetch!'.red);
                return { id: bid.id, status: 'fail' };
            }

            let desc = $("#detail_tab > div.project-description").text().replace(/\n/g, ' ').replace(/\s+/g, ' ');
            let deadline = $('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(5) > span').text().replace(/\D/g, '');
            let expertise = $('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(6) > span').text().replace(/\D/g, '');
            let views = $('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(7) > span').text().replace(/\D/g, '');
            let status = ($('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(8) > span').text().includes('باز')) ? true : false;

            let minPrice = $('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(3) > span').text().replace(/\D/g, '');
            let maxPrice = $('body > div.page-container > div.page-content-wrapper > div > div.row.sticky-container > div.col-md-4.quick-access-column > div > div > div.portlet-body > div:nth-child(1) > div > ul > li:nth-child(4) > span').text().replace(/\D/g, '');

            bid.desc = desc;
            bid.deadline = deadline;
            bid.expertise = expertise;
            bid.views = views;
            bid.status = status;
            bid.minPrice = minPrice;
            bid.maxPrice = maxPrice;



            console.log(`BID ${bid.id} Fetch!`.green.bold);
            return bid;


        } catch (error) {

            if (error.statusCode === 404) {
                console.log('- BID/'.red + bid.id + ' ' + bid.url + ' Not found'.red);
                return;
            }
            return error;
        }






    }



















    async sendBid(project_data, r_price, r_prepay, r_deadline, r_valid_day, r_message, r_chance) {

        if (project_data.id === undefined || !project_data.id) {
            return false;
        }


/* 
        let bidOptions =  {
            'init_message[bidAmount]': r_price,
            'init_message[deadline]': r_deadline,
            'init_message[initEscrowPercent]': r_prepay,
            'init_message[expertGuaranteePercent]': r_chance,
            'init_message[validDays]': r_valid_day,
            'init_message[message]': r_message,
            'files[]': '',
        }
        var options = {
            'method': 'POST',
            'url': `${this.parsCodersUrl}/conversation/init/${project_data.id}`,
            'headers': {
                'authority': 'parscoders.com',
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                'Referer': `${this.parsCodersUrl}/conversation/init/${project_data.id}`,
                "Referrer-Policy": "origin-when-cross-origin"

            },
            body: encodeURI(JSON.stringify(bidOptions))
    };


        await this.FunctionsClass.sleep(1000);



        await this.auth().then(authResult => {
        }).catch(error => {
            return error;
        }); // Login for access to scrap data

        await request(options, function (error, response, body) {
            console.log(body);
        }); // Send request for collect data


 */
        var options = {
            'method': 'POST',
            'url': `${this.parsCodersUrl}/conversation/init/${project_data.id}`,
            'headers': {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'init_message[bidAmount]': r_price,
                'init_message[deadline]': r_deadline,
                'init_message[initEscrowPercent]': r_prepay,
                'init_message[expertGuaranteePercent]': r_chance,
                'init_message[validDays]': r_valid_day,
                'init_message[message]': r_message,
                'files[]': '',
                'files[]': '',
                },
          };
          request(options).then(result => {

                if (result.error) {
                    const $ = cheerio.load(result.error);
                    let conversation_url = $("a").text();
                    if (conversation_url.includes('conversation')) {

                        if (conversation_url.includes('conversation')) {
                            console.log('+ BID/' + project_data.id + ' started successfuly')
                            console.log('Url: ' + project_data.url);
                            console.log('Cost: ' + r_price);
                            console.log('Deadline: ' + r_deadline);
                            console.log('Expertise: ' + project_data.expertise);
                            console.log('Views: ' + project_data.views);
                            console.log('Chat: ' + this.parsCodersUrl + conversation_url);
                            console.log('   ');

                        }

                    }
                }


            })
            .catch(error => {

                return;

            });


    }





















    async automaticProjectCaller(filter) {


        // Define some variables
        const allProjects = [];
        const uniqueProjects = [];
        const fetchProjects = [];

        let newProjects, newFetch;

        for (let skill_index = 0; skill_index < filter.length; skill_index++) {
            const skill = filter[skill_index];
            newProjects = await this.getNewProjects(skill)
            allProjects.push(newProjects);
        }




        allProjects.forEach((item) => { // Filter and delete duplicated items (just in case)

            if (!uniqueProjects.includes(item) && item.length > 0) {
                uniqueProjects.push(item);
            }
        });





        const flatedProjects = uniqueProjects.flat(10);
        for (let index = 0; index < flatedProjects.length; index++) { // Fetch full data for bids

            const project = flatedProjects[index];


            if (project.url != undefined) {

                newFetch = await this.fetchBid(project);
                fetchProjects.push(newFetch);

            }


        }


        fs.writeFileSync('./logs/ProjectCaller.json', JSON.stringify(fetchProjects));


        return fetchProjects; // Return


    }










    async lunchProgram(skills, recommend_message) {


        const Projects = await this.automaticProjectCaller(skills)

        var r_message;


        for (let project = 0; project < Projects.length; project++) {



            let project_obj = Projects[project];
            //const project_id = project.id;
            let price = Math.round(((parseInt(project_obj.maxPrice) * 80) / 100));

            this.FunctionsClass.sleep(250);
            await this.sendBid(project_obj,
                `${price}`,
                '10',
                `${project_obj.deadline}`,
                '15',
                r_message,
                '0'

            );



        }




    }








}


module.exports = Core;