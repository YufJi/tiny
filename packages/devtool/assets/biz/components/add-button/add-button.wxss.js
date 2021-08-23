const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'components/add-button/add-button.wxss' });
export default stylesheet.exports(`.add-button {
    display: inline-block;
    background: none;
    color: #FFF;
    border: none;
    width: 300rpx;
  }
  .add-icon {
    font-size: 52rpx;
    color: #00FFD6;
    margin-right: 10rpx;
  }
  .user {
    font-size: 150px;
  }`);