const { StyleSheet } = self.MP
const stylesheet = new StyleSheet({ stylePath: 'components/add-button/add-button.acss' });
export default stylesheet.exports(`.add-button {
    display: inline-block;
    background: none;
    color: #FFF;
    border: none;
    width: 3rem;
  }
  .add-icon {
    font-size: 0.52rem;
    color: #00FFD6;
    margin-right: 0.1rem;
  }
  .user {
    font-size: 150px;
  }`);