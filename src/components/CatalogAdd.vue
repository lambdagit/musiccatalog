<template>
    <div>
        <h4>Add catalog</h4>
        <form>
            <label for="name">Title
                <input id="title" type="text" v-model="title" required autofocus>
            </label>

            <div>
                <button type="submit" @click="handleSubmit">
                    add
                </button>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        name: 'catalog-add',
        data(){
            return {
                title : ""
            }
        },
        methods : {
            handleSubmit(e) {
                e.preventDefault()
                //TODO: field validation
                if (this.title.length > 4)
                {
                    let url = "/api/catalog"
                    this.$http.post(url, {
                        title: this.title,
                    },{
                      headers: {
                        'x-access-token': localStorage.getItem('jwt')
                      }
                    })
                    .then(response => {
                        this.$router.push('/')
                    })
                    .catch(error => {
                        console.error(error);
                    });
                    //TODO: error(serv/valid) handling
                }
            }
        }
    }
</script>

