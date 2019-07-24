<template>
  <div id="app">
    <div class="navbar navbar-expand-lg fixed-top navbar-dark bg-primary">
        <div class="container"><router-link to="/" class="navbar-brand">Home</router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarResponsive">
          <ul class="navbar-nav">
            
            <li class="nav-item" v-if="!getLogged()">
              <router-link class="nav-link" to="/login">Sign in</router-link>
            </li>
            <li class="nav-item" v-if="!getLogged()">
            <router-link class="nav-link" to="/register">Sign up</router-link>
            </li>
            <li class="nav-item" v-if="getLogged()">
            <router-link class="nav-link" click="loggedIn=false" to="/logout">Sign out</router-link>
            </li>
          </ul>
        </div>
        </div>
      </div>
    <div class="container">
       <transition name="moveInUp">
         <router-view/>
       </transition>
        
      </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){
    return {
        loggedIn : true,
    }
  },
  created () {
     this.changeLogged();
  },
  methods: {
      changeLogged() {
          this.loggedIn = localStorage.getItem('jwt') != null;
          console.log('changeLogged');
      },
      getLogged() {
          return this.loggedIn;
      }
  },
  watch: {
    '$route'() {
      this.changeLogged();
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.moveInUp-enter-active{
  animation: fadeIn 2s ease-in;
}
@keyframes fadeIn{
  0%{
    opacity: 0;
  }
  50%{
    opacity: 0.5;
  }
  100%{
    opacity: 1;
  }
}

.moveInUp-leave-active{
  animation: moveInUp .3s ease-in;
}
@keyframes moveInUp{
 0%{
  transform: translateY(0);
 }
  100%{
  transform: translateY(-400px);
 }
}
</style>
