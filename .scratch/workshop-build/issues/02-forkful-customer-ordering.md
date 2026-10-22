# 02: Forkful customer ordering

**What to build:** A customer chosen in the "Acting as" switcher can browse a menu, fill a basket, check out, place an order, and follow or cancel it under My orders. The ordering path carries the planted items exactly as the coach notes describe them.

**Blocked by:** 01

**Status:** done

Spec: [../spec.md](../spec.md)

- [x] The Menu page shows dishes by category with sold-out dishes greyed out, and a basket kept in the browser.
- [x] Checkout takes a delivery address and shows the subtotal and delivery fee, then places the order. There are no payments.
- [x] My orders lists the acting customer's orders with statuses (Placed, Accepted, Preparing, Out for delivery, Delivered, Cancelled) and a cancel button.
- [x] An "Acting as" switcher (a customer or a restaurant) stands in for a login.
- [x] The ordering rules, the naming in the web code and the time source are planted exactly as the coach notes say, and nothing more.
- [x] The dish entity, the menu endpoint and the Menu page carry none of the planted items, because the live demo builds there.
- [x] The remaining two API happy-path tests exist: a restaurant's menu returns its dishes, and placing a valid order returns 201. The suites still hold exactly the prescribed tests, and both are green.
