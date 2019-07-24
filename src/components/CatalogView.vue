<template>
  <div id="catalog-view">
    <aside class="sidebar">
     <h3>Catalogs <router-link to="/catalog/add/">+</router-link></h3>
      <router-link v-for="post in posts" v-bind:key="post.id" active-class="is-active" class="link v-link" :to="{ name: 'catalog', params: { id: post.id } }">
        {{ post.title }}
      </router-link><br>
    </aside>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>

export default {
  name: 'catalog-view',
  data () {
    return {
      posts: null,
      endpoint: '/api/catalogs'
    }
  },

  created () {
    console.log('created')
    this.getAllPosts()
  },

  methods: {
    getAllPosts () {
      this.$http.get(this.endpoint)
        .then(response => {
          this.posts = response.data
        })
        .catch(error => {
          console.log('-----error-------')
          console.log(error)
        })
    }
  },
  watch: {
    '$route'() {
      this.getAllPosts();
    }
  }
}
</script>

<style>
    .v-link {display:block}
    .sidebar {float:left; display:inline-block; width:300px;}
    .content {float:right;}
</style>
