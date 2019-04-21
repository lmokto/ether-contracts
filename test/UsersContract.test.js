const assert = require('assert');
const Web3 = require('web3');
const AssertionError = require('assert').AssertionError;
const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

const { interface, bytecode } = require('../scripts/compile');

let accounts;
let usersContract;

// usamos promesas y no callback -> ver version de web3 .beta
beforeEach(async() => { 
    accounts = await web3.eth.getAccounts();
    // recibo como parametro nuestro ABI (interface) del contracto
    UsersContract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from : accounts[0], gas: '1000000'});
});

describe('The UsersContract', async() => {

    it('should deploy', () => {
        console.log(UsersContract.options.address);
        assert.ok(UsersContract.options.address);
    });

    it('should join a user', async () => {
        let name = "Carlos";
        let surname = "Landeras";

        await UsersContract.methods.join(name, surname)
            .send({ from : accounts[0], gas: '500000' });
    });

    it('should retrive a user', async() => {
        let name = "Carlos";
        let surname = "Landeras";

        await UsersContract.methods.join(name, surname)
            .send({ from : accounts[0], gas: '500000' });
        
        let user = await UsersContract.methods.getUser(accounts[0]).call();
        assert.equal(name, user[0]);
        assert.equal(surname, user[1]);
    });

    it('should not allow joining an account twice', async() => {

        await UsersContract.methods.join("Pedro", "Lopez")
            .send({ from: accounts[1], gas: '5000000'});

        try {
            await UsersContract.methods.join("Ana", "Gomez")
                .send({ from: accounts[1], gas: '5000000'});            
            assert.fail('same account cant join twice');
        } catch (error) {
            if( error instanceof AssertionError){
                assert.fail(error.message);
            }
        } 

    });

});
