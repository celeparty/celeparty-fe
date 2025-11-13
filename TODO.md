# TODO: Implement Redirect After Login/Register

## Tasks

- [x] Modify login page to redirect to stored URL or homepage after successful login
- [x] Update login links in Header and SideBar to include redirect parameter
- [x] Update register links to include redirect parameter
- [x] Modify register page to redirect after successful registration
- [ ] Test the redirect functionality

## Details

- Default redirect: "/" (Celeparty homepage)
- If user was on product page before login/register, redirect back to that page
- Use URL query parameter "redirect" to store the current page URL
