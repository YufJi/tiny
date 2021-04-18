const { StyleSheet } = self.MP
const stylesheet = new StyleSheet({ stylePath: 'app.acss' });
export default stylesheet.exports(`.a-page {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    background: #323239;
    font-family: "pingFang SC" "pingFang";
  }`);