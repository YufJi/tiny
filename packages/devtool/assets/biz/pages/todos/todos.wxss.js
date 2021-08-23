const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/todos/todos.wxss' });
export default stylesheet.exports(`.page-todos {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    width: 100%;
    max-height: 100vh;
  }
  .user {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 30px;
    color: #FFF;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .avatar {
    width: 130rpx;
    height: 130rpx;
    border-radius: 50%;
    background-color: #FFF;
    -webkit-align-self: center;
            align-self: center;
  }
  .nickname {
    padding-top: 40rpx;
    text-align: center;
    font-size: 40rpx;
    font-weight: 100;
  }
  .test {
    font-size: 20px;
  }
  .todo-items {
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
            flex-grow: 1;
    font-size: 34rpx;
    padding: 50rpx 120rpx;
    color: #0EFFD6;
    overflow: auto;
  }
  .todo-items-group {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
  }
  .todo-item {
    position: relative;
    margin-bottom: 50rpx;
    padding-left: 80rpx;
    line-height: 70rpx;
    height: 80rpx;
    box-sizing: border-box;
    border: 2px solid rgb(14, 255, 214);
    border-radius: 100rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-transition: border 0.2s;
    transition: border 0.2s;
  }
  .todo-item:last-child {
    margin-bottom: 0;
  }
  .todo-item::before {
    content: '';
    position: absolute;
    left: 12rpx;
    margin-right: 20rpx;
    width: 45rpx;
    height: 45rpx;
    background-color: rgba(14, 222, 255, 0.3);
    border-radius: 50%;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
    -webkit-transition: background-color 0.2s;
    transition: background-color 0.2s;
  }
  .todo-item::after {
    content: '';
    position: absolute;
    left: 29rpx;
    width: 8rpx;
    height: 18rpx;
    top: 50%;
    -webkit-transform: translateY(-60%) rotate(38deg);
            transform: translateY(-60%) rotate(38deg);
    border: 4rpx solid #FFF;
    border-width: 0 4rpx 4rpx 0;
    opacity: 0;
    -webkit-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }
  .todo-item-checkbox {
    display: none;
  }
  .checked .todo-item-text {
    text-decoration: line-through;
    color: #1AA0B8;
  }
  .checked.todo-item {
    border: 2px solid rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::before {
    background-color: rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::after {
    opacity: 1;
  }
  .todo-footer {
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 50rpx 0 100rpx;
    font-size: 48rpx;
    font-weight: 200;
    text-align: center;
  }
  .page-section-title {
    padding: 0;
  }
  .swiper-item {
    display: block;
    height: 150px;
  }
  .page-section-title {
    margin-top: 30px;
    position: relative;
  }
  .info {
    position: absolute;
    right: 0;
    font-size: 15px;
  }
  .page-foot {
    margin-top: 25px;
  }
  .demo-text-1 {
    position: relative;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #1AAD19;
    color: #FFFFFF;
    font-size: 18px;
  }
  .demo-text-1:before {
    content: 'A';
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
  }
  .demo-text-2 {
    position: relative;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #2782D7;
    color: #FFFFFF;
    font-size: 18px;
  }
  .demo-text-2:before {
    content: 'B';
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
  }
  .demo-text-3 {
    position: relative;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #F1F1F1;
    color: #353535;
    font-size: 18px;
  }
  .demo-text-3:before {
    content: 'C';
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
  }`);