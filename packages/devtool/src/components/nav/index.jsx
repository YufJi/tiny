import React from 'react';
import { connect } from 'react-redux';
import global from '@/utils/global';

import style from './index.module.less';

function Nav(props) {
  const { navConfig } = props;
  const isShowBackIcon = global.pagesStack.length > 1;

  return (
    <div
      className={`${style.nav} flex-r`}
      style={{
        backgroundColor: navConfig.backgroundColor,
      }}
    >
      <div className={`${style.left} flex-r`}>
        {isShowBackIcon && <div className={`${style.back} ic`}>&#xe641;</div>}
      </div>
      <div className={`${style.title} flex-1`}>
        {navConfig.navigationBarTitleText}
      </div>
      <div className={`${style.right} flex-r`}>
        <div className={`${style.more} ic`}>&#xe648;</div>
        <div className={`${style.close} ic`} onClick={props.hideMP}>&#xe649;</div>
      </div>
    </div>
  );
}

const mapState = (state) => {
  const { nav } = state;
  return {
    navConfig: nav,
  };
};

const mapDispatch = (dispatch) => ({
  setNavConfig: (config) => dispatch.nav.setNavConfig(config),
});

export default connect(
  mapState,
  mapDispatch,
)(Nav);
