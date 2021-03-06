import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import {
  Modal,
  WhiteSpace,
  WingBlank,
  Toast,
  Flex,
  Button,
  List,
  Switch,
  Popup
} from 'antd-mobile';
import { Img } from 'commonComponent';
import * as orderApi from '../api/order';
import { common } from 'common';
import Shop from '../components/Shop';
import Fee from '../components/Fee';
import OrderBar from '../components/OrderBar';

const prompt = Modal.prompt;
const Item = List.Item;
const Brief = Item.Brief;

import './order.less';

class Order extends Component {
  constructor(props) {
    super(props);
  }

  submitOrder = () => {
    // 提交订单
    const {
      selectedAddress,
      paytype,
      isPd,
      freight,
      couponId,
      invoice,
      priceData,
      cartId
    } = this.props.order;
    orderApi.saveorder({
      cartIds: cartId,
      addressId: selectedAddress.addressId,
      paytype,
      freight,
      couponId,
      invoiceId: invoice ? invoice.id : null,
      isPd,
      activityIds: null
    }).then(result => {
      if (result.result == 1) {
        // 货到付款，成功后跳转到货到付款提示页面
        if (paytype == 2) {
          Toast.success(result.msg, 1, () => {
            window.location.href = 'home.html#/orderList/0';
          });
        } else {
          // 余额数大于 订单支付额
          // console.log(priceData);
          if (parseFloat(priceData.totalPrice) == 0) {
            console.log('支付成功，跳转到成功页面');
            this.props.router.push('/paySuccess/' + result.data[0].paySn);
          } else {
            // 跳转到收银台
            this.props.router.push(`/cashier/${result.data[0].paySn}/${priceData.totalPrice}`);
          }
        }
      } else {
        Toast.fail(result.msg);
      }
    });
  }

  onSubmitOrder = () => {

    // 提交订单
    const {
      selectedAddress,
      paytype,
      isPd,
      freight,
      couponId,
      invoiceId,
      priceData,
    } = this.props.order;
    // 验证数据
    if (!selectedAddress) {
      Modal.fail('请先选择收货地址');
      return;
    }

    // 如果使用余额支付，弹出密码输入框，，否则跳到
    if (isPd == 1 && paytype == 1) {
      prompt(
        '请输入支付密码',
        '', [{ text: '取消' }, {
          text: '提交',
          onPress: passwd => {
            orderApi.chkPasswd({ passwd }).then(result => {
              if (result.result == 1) {
                // 密码正确，继续提交订单
                this.submitOrder();
              } else {
                Toast.fail(result.msg);
              }
            })
          }
        }],
        'secure-text',
      )

    } else {
      // 在线支持 提交订单
      this.submitOrder();
    }
  }

  // 选择支付方式
  selectPayType = (type) => {
    this.props.dispatch({
      type: 'selectPayType',
      payload: type
    });
    Popup.hide();
  }

  onSelectPayTypeClick = () => {
    Popup.show(<div>
      <List renderHeader={() => '选择支付方式'}>
        <Item><Button type='primary' onClick={() => this.selectPayType(1)}>在线支付</Button></Item>
        <Item><Button type='primary' onClick={() => this.selectPayType(2)}>货到付款</Button></Item>
        <Item><Button type='ghost' onClick={()=>Popup.hide()}>取消</Button></Item>
      </List>
    </div>, { animationType: 'slide-up' })
  }

  onClickSelectedAddress = () => {
    this.props.router.push('/address');
  }

  onClickCoupon = () => {
    if (this.props.order.couponCount == 0) {
      return;
    }
    this.props.router.push(`/coupon/${this.props.params.cartId}`);
  }

  onClickInvoice = () => {
    this.props.router.push('/invoice');
  }

  onChangePd = (checked) => {
    // 刷新价格显示
    const { freight, paytype, couponId, selectedAddress, cartId } = this.props.order;
    const isPd = checked ? 1 : 0;
    orderApi.getPrice({
      cartIds: cartId,
      cityId: selectedAddress.cityId,
      freight,
      couponId,
      isPd
    }).then(r => {
      const priceData = r.data[0];
      this.props.dispatch({
        type: 'changePd',
        payload: {
          priceData,
          isPd
        }
      })
    })
  }

  componentDidMount() {
    const { isPd, freight, paytype, couponId, isInit } = this.props.order;
    if (!isInit) {
      return;
    }
    const cartId = this.props.params.cartId;
    console.log(cartId);
    orderApi.subToOrder({ cartId }).then(result => {
      if (result.result == 1) {
        const data = result.data[0];
        // console.log(data);
        this.props.dispatch({
          type: 'init',
          payload: data,
          cartId
        })

        if (data.addressList && data.addressList.length > 0) {
          let currentSelectedAddress = data.addressList[0];
          orderApi.addShipping({
            cartIds: cartId,
            cityId: currentSelectedAddress.cityId
          }).then(r => {
            if (result.result == 1) {
              this.props.dispatch({
                type: 'addShipping',
                payload: result.data[0]
              })

              // TDOO: 获取默认物流信息,是否使用余额
              // console.log(result.data[0]);
              // const freight = `result.data[0].`

              orderApi.getPrice({
                cartIds: cartId,
                cityId: currentSelectedAddress.cityId,
                isPd,
                freight,
                couponId
              }).then(r => {
                const priceData = r.data[0];
                this.props.dispatch({
                  type: 'getPrice',
                  payload: priceData
                })
              })

            } else {
              Toast.fail(result.msg);
            }
          })
        }
      }
    })
  }

  render() {
    const {
      cartVoList,
      selectedAddress,
      couponCount,
      memberAvailable,
      priceData,
      shipData,
      isPd,
      paytype,
      invoice
    } = this.props.order;
    let couponShow = couponCount > 0 ? `${couponCount}张优惠券` : '无可用优惠券';
    if (priceData.couponPrice != '0.0') {
      couponShow = `¥${priceData.couponPrice}`
    }
    let invoiceShow = '不开发票'
    // 已填写发票，并且选择的是明细
    if (invoice && invoice.invId && invoice.invContent == 2) {
      invoiceShow = invoice.invTitle
    }
    return <div className='wx-order'>
      <div className='fix-scroll hastitle' style={{paddingBottom:'1.1rem'}}>
      <List>
        <Item onClick={this.onClickSelectedAddress}
          arrow="horizontal"
          multipleLine>
          {
            selectedAddress ?<div>
              {selectedAddress.mobPhone}&nbsp;&nbsp; {selectedAddress.trueName}
              <Brief>{selectedAddress.areaInfo} {selectedAddress.address}</Brief>
            </div>: '请选择地址'
          }
        </Item>
      </List>
      {
        cartVoList.map((shop, index) => {
          return <Shop key={index} data={shop}></Shop>
        })
      }
      <List>
        <Item
          onClick={this.onSelectPayTypeClick}  
          arrow="horizontal"
          extra={paytype==1?'在线支付':'货到付款'}
          >
          支付方式
        </Item>
        <Item
          onClick={this.onClickCoupon}  
          arrow="horizontal"
          extra={couponShow}
          >
          优惠券
        </Item>
        <Item
          extra={<Switch checked={isPd == 1} onChange={this.onChangePd} />}
        >余额支付</Item>
        <Item
          extra={memberAvailable}
        >&nbsp;</Item>
        <Item
          onClick={this.onClickInvoice}    
          arrow="horizontal"
          extra={invoiceShow}
          >
          发票信息
        </Item>
      </List>
      <WhiteSpace></WhiteSpace>
      <Flex>
        <Flex.Item style={{flex:2.5}}>
          <List>
            <Item extra={`¥${priceData.totalGoodsPrice}`}>商品总价</Item>
            <Item extra={`+ ¥${priceData.totalFreight}`}>运费</Item>
            <Item extra={`- ¥${priceData.predepositAmount}`}>余额支付</Item>
            <Item extra={`- ¥${priceData.couponPrice}`}>抵用券</Item>
            <Item extra={`- ¥${priceData.conditionPrice}`}>优惠促销</Item>
          </List>
        </Flex.Item>
        <Flex.Item style={{ flex: 1 }}>
          <div >
            <div>共需支付</div>
            <div>{`¥${priceData.totalPrice}`}</div>
          </div>
        </Flex.Item>
        </Flex>
      </div>  
      <OrderBar onSubmitOrder={this.onSubmitOrder} totalPrice={priceData.totalPrice}></OrderBar>
    </div>
  }
}

function mapStateToProps({ order }) {
  return { order };
}

export default withRouter(connect(mapStateToProps)(Order));
