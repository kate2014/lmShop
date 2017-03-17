import React, { Component } from 'react';
import { Grid, Flex, WhiteSpace, List } from 'antd-mobile';
import { Img } from 'commonComponent';

class HomeNewGoodsBlock extends React.PureComponent {

  onClick = (el, index) => {
    console.log(el);
  }

  renderItem = (dataItem) => {
    return <Flex direction='column' >
      <Flex.Item>
        {dataItem.gcName}
      </Flex.Item>
      <WhiteSpace />
      <Flex.Item>
        <div style={{fontSize:'0.2rem'}} className='text-overflow-hidden gray'>{dataItem.goodsName.slice(0,14)}</div>
      </Flex.Item>
      <Flex.Item style={{textAlign:'center'}}>
        <Img src={dataItem.goodsImage} style={{ width: '80%', height:'1.5rem' }} />
      </Flex.Item>
    </Flex>
  }

  render() {
    const { data } = this.props;
    return <List renderHeader={()=>'新品上市'}>
      <Grid data={data} columnNum={3} hasLine={false}
        onClick={this.onClick}
          renderItem={(dataItem,index)=>(this.renderItem(dataItem))}>
      </Grid>
    </List>
  }
}

export default HomeNewGoodsBlock;
