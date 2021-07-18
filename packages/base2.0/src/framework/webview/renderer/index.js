/*
 * @Author: YufJ
 * @Date: 2021-07-19 00:12:32
 * @LastEditTime: 2021-07-19 02:00:49
 * @Description: 
 * @FilePath: /react-demo1/src/renderer/index.js
 */

import Reconciler from 'react-reconciler';
import { patchProps } from './patch'

const hostConfig = {
    now: () => {
        return Date.now();
    },

    getRootHostContext: (nextRootInstance) => {
        console.log('getRootHostContext', nextRootInstance)
        return nextRootInstance;
    },
    getChildHostContext: (context, type, rootInstance) => {
        console.log('getChildHostContext', context, type, rootInstance)
        return rootInstance;
    },

    // 当前节点下是否只有一个文本节点
    shouldSetTextContent: (type, nextProps) => {
        console.log('shouldSetTextContent', type, nextProps);
        return nextProps.children && (typeof nextProps.children === 'string' || typeof nextProps.children === 'number')
    },

    // 创建节点实例
    createInstance: (type, newProps, rootContainerInstance, _currentHostContext, workInProgress) => {
        console.log('createInstance', type, newProps, rootContainerInstance, _currentHostContext, workInProgress);
        const domEle = document.createElement(type);
        patchProps(domEle, newProps, null)

        return domEle;
    },

    // 创建文本节点实例
    createTextInstance: (newText, _rootContainerInstance, _currentHostContext2, workInProgress) => {
        console.log('createTextInstance', newText, _rootContainerInstance, _currentHostContext2, workInProgress)
        return document.createTextNode(newText);
    },

    // 把节点放进dom树
    appendInitialChild: (parent, child) => {
        console.log('appendInitialChild', parent, child)
        parent.appendChild(child);
    },
    appendChildToContainer: (parent, child) => {
        console.log('appendChildToContainer', parent, child)
        parent.appendChild(child);
    },
    removeChildFromContainer: (parent, child) => {
        console.log('removeChildFromContainer', parent, child);
        parent.removeChild(child);
    },

    // 更新，可以用来判断要不要更新
    prepareUpdate: (instance, type, oldProps, newProps, rootContainerInstance, currentHostContext) => {
        console.log('prepareUpdate', instance, type, oldProps, newProps, rootContainerInstance, currentHostContext)
        return true;
    },

    // 更新
    commitUpdate: (instance, updatePayload, type, oldProps, newProps, finishedWork) => {
        console.log('commitUpdate', instance, updatePayload, type, oldProps, newProps, finishedWork)
        patchProps(instance, newProps, oldProps)
    },
    // 文本节点的求值更新
    commitTextUpdate: (instance, oldText, newText) => {
        console.log('commitTextUpdate', instance, oldText, newText)
        instance.nodeValue = newText;
    },

    // 下面的方法似乎没啥用，实现一下防止报错
    prepareForCommit: (containerInfo) => {
        console.log('prepareForCommit', containerInfo)
    },
    resetAfterCommit: (containerInfo) => {
        console.log('resetAfterCommit', containerInfo)
    },
    
    finalizeInitialChildren: (instance, type, newProps, rootContainerInstance, _currentHostContext) => {
        console.log('finalizeInitialChildren', instance, type, newProps, rootContainerInstance, _currentHostContext)
    },

    clearContainer: (container) => {
        console.log('clearContainer', container);
        if (container !== null) {
            // lastChild causes less reflow than firstChild
            let dom = container.lastChild;
            // there should be only a single entry for the root
            while (dom) {
              const next = dom.previousSibling;
              container.removeChild(dom);
              dom = next;
            }
          }
    },
    
    supportsMutation: true
};

const ReconcilerInst = Reconciler(hostConfig);

const Renderer = {
    render: (reactElement, domElement, callback) => {
      // Create a root Container if it doesnt exist
      if (!domElement._rootContainer) {
        domElement._rootContainer = ReconcilerInst.createContainer(domElement, false);
      }
      
      // update the root Container
      return ReconcilerInst.updateContainer(reactElement, domElement._rootContainer, null, callback);
    }
}

export default Renderer