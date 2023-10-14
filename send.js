const Parscoders = require('./module/Parscoders');

async function send() {

    let skills = [ // Enter you skills like this here.
        'mysql', 
        'nodejs', 
        'php', 
        'psd-to-html', 
        'reactjs', 
        'sass', 
        'ux', 
        'woocommerce', 
        'wordpress' 
     ];

    
    const ParscodersClass = new Parscoders('#USERNAME OF PARSCODERS.COM', '#PASSWORD')

    await ParscodersClass.lunchBid(skills , 'DEPTH OF PROGRAM (RANGE 1 SHORT - 5 HARD)' , '#YOUR MESSAGE FOR OFFER'    
    )

}

send()