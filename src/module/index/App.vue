<template>
  <div id="app">
    <div>
      <div id="header" class="clear">
        <div class="header-left">
          <img :src="userimg" alt="">
        </div>
        <div class="header-middle">
          {{username}}
        </div>
        <a href="tel:400-636-8888" class="header-right">
          400-636-8888
        </a>
      </div>
      <div id="content">
        <ul class="clear">
          <li>
            <a href="#">
              <img src="../../common/img/index/dingdan.png"/>
              <span>我的订单</span>
            </a>
          </li>
          <li>
            <a href="#">
              <img src="../../common/img/index/tuijian.png"/>
              <span>我的推荐</span>
            </a>
          </li>
          <li>
            <a href="#">
              <img src="../../common/img/index/tianjia.png"/>
              <span>保单添加</span>
            </a>
          </li>
          <li>
            <a href="query.html">
              <img src="../../common/img/index/chaxun.png"/>
              <span>查询服务</span>
            </a>
          </li>
        </ul>
        <ul class="clear">
          <li>
            <a href="#">
              <img src="../../common/img/index/huizhi.png"/>
              <span>微回执</span>
            </a>
          </li>
          <li>
            <a href="#">
              <img src="../../common/img/index/huifang.png"/>
              <span>微回访</span>
            </a>
          </li>
         <li>
           <a href="#">
              <img src="../../common/img/index/lipei.png"/>
              <span>理赔服务</span>
           </a>
          </li>
          <li>
            <a href="#">
              <img src="../../common/img/index/tuanxian.png"/>
               <span>团险服务</span>
            </a>
          </li>
        </ul>
        <ul class="clear">
          <li>
            <a href="#">
              <img src="../../common/img/index/lilv.png"/>
              <span>利率公告</span>
            </a>
          </li>
          <li>
            <a href="#">
              <img src="../../common/img/index/guimian.png"/>
              <span>服务柜面</span>
            </a>
          </li>
          <li>
            <a href="">

            </a>
          </li>
          <li>
            <a href="">

            </a>
          </li>
        </ul>
      </div>
    </div>
    <!--<router-view></router-view>-->
  </div>
</template>

<script>
  export default {
    name: 'app',
    data(){
      return{
        username:"",
        userimg:""
      }
    },
    methods:{
      getData(){

      }
    },
    mounted(){
        this.getData();
    }
  }
</script>

<style scoped>
  @import "../../common/css/general.css";
  @import "../../common/css/index.css";

</style>

