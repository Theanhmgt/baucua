const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// get data from localStorage
var USERINFO = JSON.parse(localStorage.getItem('USERINFO')) || {};
var users = USERINFO.users || [];
var currentUser = USERINFO.currentUser || null;

var coinUser = 10000;
var innerCoin = $('.coin-user')
innerCoin.innerText = `${coinUser}` // In số coin của người dùng

var plusNodeList = $$('.increase')
var minusNodeList = $$('.reduce')
var startSpin = $('.spin')
var imgDice1 = $('#dice1')
var imgDice2 = $('#dice2')
var imgDice3 = $('#dice3')
var coinsHtml = $$('.coin')
var toastHtml = $('#toast')
var overlayElement = $('.over-lay');
var accountModal = $('.account');

var imageDice = [
    "./img/bau.jpg", "./img/cua.jpg", "./img/tom.jpg",
    "./img/ca.jpg", "./img/ga.jpg", "./img/huou.jpg"
]
const app = {
    // totalBet: 0,
    betMoney: [ // mang luu so tien nguoi dat
        { name: 'bau', coin: 0 },
        { name: 'cua', coin: 0 },
        { name: 'tom', coin: 0 },
        { name: 'ca', coin: 0 },
        { name: 'ga', coin: 0 },
        { name: 'nai', coin: 0 },
    ],
    afterDice: [ // mang lưu số lượng xúc sắc quay ra
        { name: 'bau', quanti: 0 },
        { name: 'cua', quanti: 0 },
        { name: 'tom', quanti: 0 },
        { name: 'ca', quanti: 0 },
        { name: 'ga', quanti: 0 },
        { name: 'nai', quanti: 0 }
    ],
    handelEvents: function() {
        var resultRandomDice1;
        var resultRandomDice2;
        var resultRandomDice3;
        var coinUserBeforDice = coinUser; // dùng để so sách với số tiền ban đầu => tiền thắng thua trong một ván 
        var toast = { // đối tượng thông báo
            title: '',
            coin: '', // nếu hoà sẽ chỉ in ra khoảng trắng '' chứ không in ra số 0
            condition: '',
        };

        // Xử lý sự kiện tăng tiền
        plusNodeList.forEach( (nodeItem, index) => {
            nodeItem.onclick = e => {
                if (coinUser > 0) // Số tiền người dùng đang có phải lớn 0 thì mới cho đặt tiền
                {
                    coinUser -= 1000; // khi dat vao mot o thi tru so tien user
                    var innerCoinUser = $('.coin-user').innerText = `${coinUser}` // Lấy element và in ra số tiền của người dùng sau mỗi một lần ấn đặt tiền

                    this.betMoney[index].coin += 1000; // cộng số tiền đặt vào mảng betMoney ứng với index tương ứng

                    var coinHtml = $(`.coin.${e.target.classList[1]}`); //Hiển thị số tiền tăng giảm ở trang chính
                    coinHtml.innerText = `${this.betMoney[index].coin}`
                }
            }
        })

        // Xu ly su kien giam tien
        minusNodeList.forEach((nodeItem, index) => {

            nodeItem.onclick = (e) => {
                if (this.betMoney[index].coin > 0) // Ô nào có tiền đã đặt thì mới cho giảm tiền
                {
                    coinUser += 1000;
                    var innerCoinUser = $('.coin-user').innerText = `${coinUser}`

                    this.betMoney[index].coin -= 1000;

                    var coinHtml = $(`.coin.${e.target.classList[1]}`);
                    coinHtml.innerText = `${this.betMoney[index].coin}`

                    if (this.betMoney[index].coin == 0) { // Nếu giảm số tiền đã đặt về 0 thì in ra chuỗi rỗng
                        coinHtml.innerText = '';
                    }
                }
            }

        })

        // Xu ly su kien quay xuc sac
        startSpin.onclick = () => {

            var randomDice = setInterval( () => { // Thay đổi hình ảnh của 3 ô xúc sắc và ramdom 0-5 sau mỗi 50ms
                resultRandomDice1 = Math.floor(Math.random() * 6);
                resultRandomDice2 = Math.floor(Math.random() * 6);
                resultRandomDice3 = Math.floor(Math.random() * 6);

                imgDice1.style.background = `url("${imageDice[resultRandomDice1]}") top center / cover no-repeat `
                imgDice2.style.background = `url("${imageDice[resultRandomDice2]}") top center / cover no-repeat `
                imgDice3.style.background = `url("${imageDice[resultRandomDice3]}") top center / cover no-repeat `
            }, 50);

            setTimeout(() => { // Dừng và xử lý sự kiện sau 3s quay

                clearInterval(randomDice) // Dừng sự kiện quay

                for (var i = 0; i < 6; i++) // So sánh và tăng số lượng xúc sắc nếu quay ra vào mảng afterDice
                {
                    if (i == resultRandomDice1) { this.afterDice[i].quanti += 1 }
                    if (i == resultRandomDice2) { this.afterDice[i].quanti += 1 }
                    if (i == resultRandomDice3) { this.afterDice[i].quanti += 1 }
                }

                for (var i = 0; i < 6; i++) // So sánh với những mặt xúc sắc tung trúng => tiền
                {
                    // Ô nào đặt tiền && ô đó có xúc sắc đã quay ra thì mới tính tiền
                    if (this.betMoney[i].coin > 0 && this.afterDice[i].quanti > 0) {
                        coinUser += this.afterDice[i].quanti * this.betMoney[i].coin + this.betMoney[i].coin;
                    }

                    coinsHtml[i].innerText = ' '; // xoá số tiền tăng giảm hiện thị ở màn hình
                    this.betMoney[i].coin = 0; // cap nhap lai so tien dat = 0
                    this.afterDice[i].quanti = 0; // cập nhập lại số xúc sắc đã quay ra

                }
                // update coin in database after dice
                updateCoin();

                // In lai so tien user sau một ván
                var innerCoin = $('.coin-user')
                innerCoin.innerText = `${coinUser}`

                // In thông báo(toast) số tiền thắng hoặc thua
                if (coinUser - coinUserBeforDice > 0) {
                    toast.title = 'Lượt này bạn thắng:'
                    toast.coin = `${coinUser - coinUserBeforDice}`
                    toast.condition = 'win'
                } else if (coinUser - coinUserBeforDice < 0) {
                    toast.title = 'Lượt này bạn thua:'
                    toast.coin = `${(coinUserBeforDice - coinUser)}` // nhân với trừ 1 để không hiển thị dấu trừ ra ngoài mh
                    toast.condition = 'lose'
                } else {
                    toast.title = 'Lượt này bạn hoà!'
                    toast.condition = 'tie'
                }
                coinUserBeforDice = coinUser; //Cap nhap lai sau moi lan quay


                // Bat dau tao thong bao
                if (toastHtml) {
                    const newToast = document.createElement('div'); // tao mot the div moi

                    newToast.classList.add('toast', `${toast.condition}`); // them class, thêm trạng thái thắng thua hoà bằng modifier
                    newToast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s 4s forwards`;
                    newToast.innerHTML = `
                        <div class="outer-container">
                        <i class="fa-solid fa-gamepad icon-conditon-toast"></i>
                        </div>
                        <div class="inner-container">
                        <p>${toast.title}</p>
                        <p>${toast.coin}</p>
                        </div>
                        <div class="toast-control">
                        <div>Show</div>
                        <div>Later</div>
                        </div>
                    `;
                    toastHtml.appendChild(newToast)
                    
                    // Cập nhập lại mảng toast
                    for(item in toast) {
                        toast[item] = '';
                    }

                    setTimeout(function() { // sau khi hien thong bao xong thi xoá bỏ
                            toastHtml.removeChild(newToast);

                        }, 5000) // sau khoảng thời gian 4s dalay + 1s để fadeOut thì xoá bỏ
                }
            }, 2000)

        }

        const updateCoin = () => {
            //get user in users by currentUser
            let user = users.find(user => {
                return currentUser.id === user.id;
            });

            // format coin in user & currentUser
            user.coin = coinUser;
            currentUser.coin = coinUser;

            // update coin in localStorage
            this.updateLocalStorage(currentUser, users);
        }
    },
    
    // update USERINFO in localStorage
    updateLocalStorage(currentUser, users) {
        USERINFO = {
            currentUser,
            users
        };
        localStorage.setItem('USERINFO', JSON.stringify(USERINFO));
    },
    handleSigning: () => {
        // Select signin & signup form
        const signingForms = $$('.signing-form');
        signingForms.forEach(form => { // handle form
            form.onsubmit = e => {
                e.preventDefault();

                // Get value from form input
                const gmail = form.querySelector('input[name="gmail"]').value;
                const pass = form.querySelector('input[name="password"]').value;
                const userInput = {
                    gmail,
                    pass
                };

                if (form.matches('#sign-up')) { //if form is sign up form
                    const repass = form.querySelector('input[name="re-password"]').value;
                    if (gmail.trim() !== '' && !findGmail(users, userInput.gmail) && pass === repass) {
                        //create new user
                        let user = {
                            id: users.length + 1,
                            gmail,
                            pass,
                            coin: 10000
                        };
                        users.push(user); //push user to users
                        currentUser = user; // set current user

                        // update users & push to localStorage
                    }
                }
                // handle sign in form
                handleSignin(userInput);
                this.updateLocalStorage(currentUser, users);
            }
        })

        function findGmail(users, gmail) { // get user obj by gmail input
            return users.find(user => {
                return user.gmail === gmail;
            });
        }

        function handleSignin(userInput) {
            const user = findGmail(users, userInput.gmail); // get user
            if (user) { // if user is contains
                if (user.pass === userInput.pass) { // if pass is matches
                    // hide overlay & modal
                    overlayElement.style.display = 'none';
                    accountModal.style.display = 'none';

                    // set coinUser & render
                    currentUser = user;
                    coinUser = user.coin;
                    innerCoin.innerText = `${coinUser}`; // In số coin của người dùng
                }
            }
        }
    },
    start: function() {
        this.handleSigning();
        this.handelEvents();
    }
}
app.start();