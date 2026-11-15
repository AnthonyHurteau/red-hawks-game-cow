import { createRouter, createWebHistory } from "vue-router"
import VoteView from "../views/VoteView.vue"

export const enum ROUTE_NAMES {
  VOTE = "vote",
  ADMIN = "admin",
  ROSTER = "roster"
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: ROUTE_NAMES.VOTE,
      component: VoteView
    },
    {
      path: "/admin",
      name: ROUTE_NAMES.ADMIN,
      component: () => import("../views/AdminView.vue")
    },
    {
      path: "/admin/roster",
      name: ROUTE_NAMES.ROSTER,
      component: () => import("../views/RosterView.vue")
    }
  ]
})

export default router
