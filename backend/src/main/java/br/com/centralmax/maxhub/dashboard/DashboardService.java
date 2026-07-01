package br.com.centralmax.maxhub.dashboard;

import br.com.centralmax.maxhub.customer.CustomerRepository;
import br.com.centralmax.maxhub.order.OrderRepository;
import br.com.centralmax.maxhub.product.ProductRepository;
import br.com.centralmax.maxhub.product.ProductStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        long activeProducts = productRepository.count(
                (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ATIVO)
        );
        long totalCustomers = customerRepository.count();
        long totalOrders = orderRepository.count();
        return new DashboardResponse(activeProducts, totalCustomers, totalOrders);
    }
}
