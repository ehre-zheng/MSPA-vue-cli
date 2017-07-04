<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>这是hello组件</h2>
    <ul>
      <li><router-link to="/index/second">second</router-link>asdasd</li>
      <li><router-link to="/index/first">first</router-link>first</li>
    </ul>
  </div>
</template>

<script>
export default {
//  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
  li {
    display: inline-block;
    margin: 0 10px;
    background:red;
  }
}



a {
  color: #42b983;
}
</style>
